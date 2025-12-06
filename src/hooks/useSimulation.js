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
          const sourceNode = nodes.find(n => n.id === edge.source);

          // Calculate measurements
          let current = 0;
          let voltage = 0;

          if (sourcePowerInfo?.isPowered && targetNode) {
            // Get voltage from target node parameters
            voltage = targetNode.data?.parameters?.voltage || 208;

            // Get power draw - for edges going into transfer switches, 
            // only show load if this edge is the active input
            let powerWatts = 0;
            
            if (targetNode.type === 'ats' || targetNode.type === 'mts') {
              // Check if this edge is the active input for the transfer switch
              const targetHandle = edge.targetHandle || 'input-0';
              const targetPowerInfo = flowMap.get(targetNode.id);
              
              // Determine which handle should be active
              let activeHandle = null;
              
              if (targetNode.type === 'ats') {
                // ATS: primary (input-0) is preferred, secondary (input-1) only if primary has no power
                const incomingEdges = edges.filter(e => e.target === targetNode.id && !faultedEdges.has(e.id));
                const primaryEdge = incomingEdges.find(e => (e.targetHandle || 'input-0') === 'input-0');
                const secondaryEdge = incomingEdges.find(e => e.targetHandle === 'input-1');
                
                const primarySourcePowered = primaryEdge && flowMap.get(primaryEdge.source)?.isPowered;
                const secondarySourcePowered = secondaryEdge && flowMap.get(secondaryEdge.source)?.isPowered;
                
                if (primarySourcePowered) {
                  activeHandle = 'input-0';
                } else if (secondarySourcePowered) {
                  activeHandle = 'input-1';
                }
              } else if (targetNode.type === 'mts') {
                // MTS: based on manual selection
                const manualSelection = targetNode.data?.parameters?.selectedSource ?? 0;
                const selectedHandle = manualSelection === 0 ? 'input-0' : 'input-1';
                
                // Find the edge for the selected handle
                const incomingEdges = edges.filter(e => e.target === targetNode.id && !faultedEdges.has(e.id));
                const selectedEdge = incomingEdges.find(e => (e.targetHandle || 'input-0') === selectedHandle);
                const selectedSourcePowered = selectedEdge && flowMap.get(selectedEdge.source)?.isPowered;
                
                if (selectedSourcePowered) {
                  activeHandle = selectedHandle;
                }
              }
              
              // Only show load on this edge if it's the active input
              if (targetHandle === activeHandle) {
                powerWatts = loadMap.get(targetNode.id) || 0;
              }
              // else powerWatts stays 0
            } else {
              // For non-transfer-switch targets, use normal load calculation
              powerWatts = loadMap.get(targetNode.id) || 0;
            }
            
            current = (powerWatts / voltage) || 0;
          }

          // Update the power meter node with measurements
          const currentMeasurements = node.data?.measurements || {};
          // Use a small epsilon for float comparison to avoid thrashing
          const epsilon = 0.001;
          const currentChanged = Math.abs((currentMeasurements.current || 0) - current) > epsilon;
          const voltageChanged = Math.abs((currentMeasurements.voltage || 0) - voltage) > epsilon;

          // Track historical data for trend graph
          const powerKW = parseFloat((current * voltage / 1000).toFixed(2));
          let history = [...(currentMeasurements.history || [])];
          
          // If simulation hour is 0 and we have history data that goes beyond hour 0,
          // it means simulation restarted - clear history
          if (simulationHour === 0 && history.length > 1) {
            history = [];
          }
          
          // Check if we already have data for this hour
          const existingIndex = history.findIndex(h => h.hour === simulationHour);
          if (existingIndex >= 0) {
            // Update existing hour data
            history[existingIndex] = { hour: simulationHour, power: powerKW };
          } else {
            // Add new hour data
            history.push({ hour: simulationHour, power: powerKW });
            // Sort by hour
            history.sort((a, b) => a.hour - b.hour);
          }

          const historyChanged = JSON.stringify(currentMeasurements.history) !== JSON.stringify(history);

          if (currentChanged || voltageChanged || historyChanged) {
            updateNode(node.id, {
              data: {
                ...node.data,
                measurements: {
                  current,
                  voltage,
                  power: powerKW.toFixed(2),
                  history,
                },
              },
            });
          }
        }
      }
    });
  }, [nodes, edges, faultedNodes, faultedEdges, simulationHour, setPowerFlowMap, setPowerSources, setInstantaneousLoadMap, updateNode, addNodeFault]);
}
