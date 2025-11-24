import { useEffect } from 'react';
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
  } = useSimulationStore();

  // Auto-calculate power flow whenever diagram changes
  useEffect(() => {
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

    // Calculate instantaneous load
    const loadMap = calculateInstantaneousLoad(
      nodes,
      edges,
      faultedNodes,
      faultedEdges,
      simulationHour
    );
    setInstantaneousLoadMap(loadMap);

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
          if (currentMeasurements.current !== current || currentMeasurements.voltage !== voltage) {
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
  }, [nodes, edges, faultedNodes, faultedEdges, simulationHour, setPowerFlowMap, setPowerSources, setInstantaneousLoadMap, updateNode]);
}
