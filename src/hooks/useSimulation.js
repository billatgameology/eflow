import { useEffect } from 'react';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useSimulationStore } from '../stores/useSimulationStore';
import { calculatePowerFlow, extractPowerSources } from '../utils/powerFlowCalculator';

export function useSimulation() {
  const { nodes, edges } = useDiagramStore();
  const {
    faultedNodes,
    faultedEdges,
    setPowerFlowMap,
    setPowerSources,
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
  }, [nodes, edges, faultedNodes, faultedEdges, setPowerFlowMap, setPowerSources]);
}
