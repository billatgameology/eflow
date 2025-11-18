/**
 * Calculate power flow through the diagram
 * Returns a Map of nodeId -> { sources: [], color: string, isPowered: boolean }
 */
export function calculatePowerFlow(nodes, edges, faultedNodes, faultedEdges) {
  const powerFlowMap = new Map();

  // Initialize all nodes as unpowered
  nodes.forEach((node) => {
    powerFlowMap.set(node.id, {
      sources: [],
      color: null,
      isPowered: false,
    });
  });

  // Find all power sources from nodes
  const powerSources = nodes
    .filter((node) => node.data.parameters?.isPowerSource && !faultedNodes.has(node.id))
    .map((node) => ({
      id: node.id,
      nodeId: node.id,
      color: node.data.equipment?.color || '#00D9FF',
      label: node.data.label || node.data.equipment?.label,
    }));

  // For each power source, traverse the graph using BFS
  powerSources.forEach((source) => {
    const visited = new Set();
    const queue = [{ nodeId: source.nodeId, sourceColor: source.color, sourceLabel: source.label }];

    while (queue.length > 0) {
      const { nodeId: currentNodeId, sourceColor, sourceLabel } = queue.shift();

      // Skip if already visited from this source
      const visitKey = `${currentNodeId}-${source.id}`;
      if (visited.has(visitKey)) continue;
      visited.add(visitKey);

      // Skip if node is faulted
      if (faultedNodes.has(currentNodeId)) continue;

      // Get current node
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) continue;

      // Mark as powered from this source
      const powerInfo = powerFlowMap.get(currentNodeId);

      // Check if this source is already tracked
      if (!powerInfo.sources.find(s => s.id === source.id)) {
        powerInfo.sources.push({
          id: source.id,
          color: sourceColor,
          label: sourceLabel,
        });
      }

      powerInfo.isPowered = true;

      // Set color (if multiple sources, we'll show multiple indicators)
      if (powerInfo.sources.length === 1) {
        powerInfo.color = sourceColor;
      } else {
        // Multiple sources - keep array of colors
        powerInfo.color = powerInfo.sources.map(s => s.color);
      }

      // Find outgoing edges from this node
      const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

      outgoingEdges.forEach((edge) => {
        // Skip faulted edges
        if (faultedEdges.has(edge.id)) return;

        // Add target to queue with the same source info
        queue.push({
          nodeId: edge.target,
          sourceColor: sourceColor,
          sourceLabel: sourceLabel,
        });
      });
    }
  });

  return powerFlowMap;
}

/**
 * Get power sources from nodes
 */
export function extractPowerSources(nodes) {
  return nodes
    .filter((node) => node.data.parameters?.isPowerSource)
    .map((node) => ({
      id: node.id,
      nodeId: node.id,
      color: node.data.equipment?.color || '#00D9FF',
      label: node.data.label || node.data.equipment?.label,
    }));
}
