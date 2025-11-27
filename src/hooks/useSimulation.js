import { useEffect, useRef } from 'react';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useSimulationStore } from '../stores/useSimulationStore';
import { calculatePowerFlow, extractPowerSources, calculateInstantaneousLoad } from '../utils/powerFlowCalculator';

export function useSimulation() {
  const { nodes, edges, updateNode } = useDiagramStore();
  const {
    faultedNodes,
    faultedEdges,
    simulationHour,
    setPowerFlowMap,
    setPowerSources,
    setInstantaneousLoadMap,
    instantaneousLoadMap,
    addNodeFault,
  } = useSimulationStore();

  const lastSignatureRef = useRef('');

  // Auto-calculate power flow whenever diagram changes
  useEffect(() => {
    // Create a signature that only includes electrically relevant data
    // We explicitly exclude 'position', 'selected', 'dragging' (top level)
    // And 'measurements' from data (to prevent infinite loops when we update them)
    const relevantNodes = nodes.map(n => ({
      id: n.id,
      type: n.type,
      // Only include data parameters that affect simulation
      data: {
        ...n.data,
        measurements: undefined, // Exclude output to prevent loops
        // We need parameters, equipment, label, etc.
      }
    }));

    const signature = JSON.stringify({
      nodes: relevantNodes,
      edges,
      faultedNodes: Array.from(faultedNodes).sort(),
      faultedEdges: Array.from(faultedEdges).sort(),
      simulationHour
    });

    // If signature hasn't changed, skip calculation
    if (signature === lastSignatureRef.current) {
      return;
    }
    lastSignatureRef.current = signature;

    // Extract power sources
    const sources = extractPowerSources(nodes);
    setPowerSources(sources);

    // Calculate power flow
    const flowMap = calculatePowerFlow(
      nodes,
      edges,
      faultedNodes,
      faultedEdges
    );

    setPowerFlowMap(flowMap);

    // Calculate instantaneous load (pass flowMap to check if nodes are powered)
    const loadMap = calculateInstantaneousLoad(
      nodes,
      edges,
      faultedNodes,
      faultedEdges,
      simulationHour,
      flowMap
    );
    setInstantaneousLoadMap(loadMap);

    // Overload Protection: Only for circuit breakers and switchgear
    nodes.forEach((node) => {
      // Only check circuit breakers and switchgear
      if (node.type !== 'circuitBreaker' && node.type !== 'switchgear') return;

      // Skip if already faulted
      if (faultedNodes.has(node.id)) return;

      const currentLoadWatts = loadMap.get(node.id) || 0;
      const currentLoadKW = currentLoadWatts / 1000;

      // Check kW Rating (Max Load) - with 5% tolerance to avoid edge cases
      if (node.data?.parameters?.kwRating) {
        let ratedKW = parseFloat(node.data.parameters.kwRating);

        // Only fault if load exceeds 105% of rating
        if (currentLoadKW > ratedKW * 1.05) {
          addNodeFault(node.id);
        }
      }

      // Check Amperage Rating (if available) - with 5% tolerance
      // Support both 'current' and 'ampRating' parameter names
      const ratedAmps = node.data?.parameters?.current || node.data?.parameters?.ampRating;
      if (ratedAmps) {
        const ratedAmpsValue = parseFloat(ratedAmps);
        const voltage = node.data.parameters.voltage || 120; // Default voltage if missing
        const currentAmps = currentLoadWatts / voltage;

        // Only fault if current exceeds 105% of rating
        if (currentAmps > ratedAmpsValue * 1.05) {
          addNodeFault(node.id);
        }
      }
    });


    // Update power meter measurements
    nodes.forEach((node) => {
      if (node.type === 'powerMeter' && node.data?.parameters?.monitoredEdgeId) {
        const edgeId = node.data.parameters.monitoredEdgeId;
        const edge = edges.find(e => e.id === edgeId);

        if (edge) {
          // Get power info from the source node
          const sourcePowerInfo = flowMap.get(edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          // Calculate measurements
          let current = 0;
          let voltage = 0;

          if (sourcePowerInfo?.isPowered && targetNode) {
            // Get voltage from target node parameters
            voltage = targetNode.data?.parameters?.voltage || 208;

            // Get current from target node parameters or calculate from power draw
            const powerWatts = loadMap.get(targetNode.id) || 0;
            current = (powerWatts / voltage) || 0;
          }

          // Update the power meter node with measurements
          const currentMeasurements = node.data?.measurements || {};
          // Use a small epsilon for float comparison to avoid thrashing
          const epsilon = 0.001;
          const currentChanged = Math.abs((currentMeasurements.current || 0) - current) > epsilon;
          const voltageChanged = Math.abs((currentMeasurements.voltage || 0) - voltage) > epsilon;

          if (currentChanged || voltageChanged) {
            updateNode(node.id, {
              data: {
                ...node.data,
                measurements: {
                  current,
                  voltage,
                  power: (current * voltage / 1000).toFixed(2),
                },
              },
            });
          }
        }
      }
    });
  }, [nodes, edges, faultedNodes, faultedEdges, simulationHour, setPowerFlowMap, setPowerSources, setInstantaneousLoadMap, updateNode, addNodeFault]);
}
