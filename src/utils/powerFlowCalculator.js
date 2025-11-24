import { interpolateValueAtHour } from './loadProfile';

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

/**
 * Calculate instantaneous load for all nodes (Bottom-Up)
 * Returns a Map of nodeId -> loadInWatts (number)
 */
export function calculateInstantaneousLoad(nodes, edges, faultedNodes, faultedEdges, simulationHour = 0, powerFlowMap = null) {
  const loadMap = new Map();

  // Initialize all nodes with 0 load
  nodes.forEach((node) => {
    loadMap.set(node.id, 0);
  });

  // 1. Calculate Load for Servers (Leaf Nodes)
  const servers = nodes.filter((node) => node.type === 'server');

  servers.forEach((server) => {
    if (faultedNodes.has(server.id)) return;

    // Only calculate load if the server is actually powered
    if (powerFlowMap) {
      const powerInfo = powerFlowMap.get(server.id);
      if (!powerInfo?.isPowered) {
        loadMap.set(server.id, 0);
        return;
      }
    }

    // Get rated power (default to 10kW if missing)
    const ratedKW = server.data.parameters?.kwRating || 10;
    const racksInRow = Math.max(server.data.parameters?.racksInRow || 1, 1);
    const ratedWatts = ratedKW * 1000 * racksInRow;

    // Determine utilization factor
    let utilization = 0.5; // Default 50%

    // Check for attached Load Profile
    // Prioritize internal load profile data if available (from properties panel)
    if (server.data?.loadProfile?.points) {
      utilization = interpolateValueAtHour(server.data.loadProfile.points, simulationHour) / 100;
    }
    // Fallback to external profile node (legacy/visualizer)
    else if (server.data?.profileNodeId) {
      const profileNode = nodes.find((n) => n.id === server.data.profileNodeId);
      if (profileNode?.data?.loadProfile?.points) {
        utilization = interpolateValueAtHour(profileNode.data.loadProfile.points, simulationHour) / 100;
      }
    }

    const currentLoad = ratedWatts * utilization;
    loadMap.set(server.id, currentLoad);
  });

  // 2. Propagate Load Upstream (Bottom-Up)
  // We need to traverse from loads to sources.
  // Since graph can be complex, we can iterate multiple times or use a topological sort.
  // Simple approach: Repeatedly propagate load to parents until stable or max iterations.
  // Given the depth is shallow (Server -> PDU -> UPS -> Switchgear -> Utility), 10 iterations is plenty.

  for (let i = 0; i < 10; i++) {
    let changed = false;

    // Create a temporary map for this iteration to avoid double counting if we processed in wrong order
    // Actually, we can just accumulate.
    // But to do it correctly: ParentLoad = Sum(ChildLoads)
    // We should reset non-leaf loads to 0 before summing? 
    // No, because we want to propagate.

    // Better approach:
    // Identify all edges that carry power (Source -> Target).
    // We want to flow Load from Target -> Source.

    // Reset non-server loads to 0 for recalculation
    nodes.forEach(node => {
      if (node.type !== 'server') {
        loadMap.set(node.id, 0);
      }
    });

    // We need to process levels. 
    // Let's just iterate edges.
    // For each node, find who feeds it.
    // Actually, it's easier to look at edges: Source -> Target.
    // Target demands power from Source.
    // So Source.Load += Target.Load.

    // But if Target has multiple sources? (Dual power)
    // We assume 50/50 split for active-active, or 100/0 for active-passive.
    // For simplicity: Split load equally among active sources.

    // We need to do this in order: Servers are ready.
    // Then PDUs that feed servers.
    // Then Switchgear that feeds PDUs.

    // Let's just iterate all nodes and sum their children's load.
    // But we need to do it in reverse topological order.
    // Since we don't have that handy, we'll just loop until convergence.

    const currentIterationMap = new Map(loadMap); // Start with server loads

    // We need to calculate the load for non-server nodes based on what they supply
    // This is tricky with loops, but we assume DAG.

    // Let's try a different approach:
    // Get all connections.
    // Build a "Consumers" map: SourceId -> [ConsumerId1, ConsumerId2]
    const consumersMap = new Map();
    edges.forEach(edge => {
      if (faultedEdges.has(edge.id)) return;
      if (!consumersMap.has(edge.source)) {
        consumersMap.set(edge.source, []);
      }
      consumersMap.get(edge.source).push(edge.target);
    });

    // Now we need to calculate load for nodes that have consumers.
    // But we need the consumers to be calculated first.
    // Recursive function with memoization/visited check?

    const calculateNodeLoad = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return 0; // Cycle detection
      visited.add(nodeId);

      // If it's a server, return its calculated load
      const node = nodes.find(n => n.id === nodeId);
      if (node?.type === 'server') {
        return loadMap.get(nodeId);
      }

      // If not a server, sum up loads of all consumers
      const consumers = consumersMap.get(nodeId) || [];
      let totalLoad = 0;

      consumers.forEach(consumerId => {
        // Skip if consumer is faulted - faulted nodes don't pull load
        if (faultedNodes.has(consumerId)) return;

        // How much load does this consumer pull from THIS source?
        // Check how many active sources the consumer has.
        const consumerNode = nodes.find(n => n.id === consumerId);
        if (!consumerNode) return;

        // Find all active sources for this consumer (excluding faulted source nodes)
        const incomingEdges = edges.filter(e =>
          e.target === consumerId &&
          !faultedEdges.has(e.id) &&
          !faultedNodes.has(e.source) // Don't count sources that are faulted
        );
        const activeSourcesCount = incomingEdges.length;

        if (activeSourcesCount > 0) {
          // Get total load of consumer (recursively calculated?)
          // Wait, if we recurse down, we are going Source -> Target.
          // But load is at the bottom.
          // So we need to ask the consumer: "What is your total load?"
          // And then divide by active sources.

          // This requires the consumer's load to be known.
          // If the consumer is a server, it is known.
          // If the consumer is a PDU, it needs to sum its servers first.

          // So recursion works: GetLoad(PDU) = Sum(GetLoad(Server))
          const consumerLoad = calculateNodeLoad(consumerId, new Set(visited));
          totalLoad += (consumerLoad / activeSourcesCount);
        }
      });

      return totalLoad;
    };

    // Now calculate for all nodes
    nodes.forEach(node => {
      // We only need to calculate for non-servers, but the function handles servers too.
      // However, we want to update the map.
      // The recursive function is expensive if called for every node blindly.
      // But for < 100 nodes it's fine.
      if (node.type !== 'server') {
        loadMap.set(node.id, calculateNodeLoad(node.id));
      }
    });

    // The recursive function above has a flaw: it re-calculates deep nodes many times.
    // But it ensures correct order.
    // Let's use it.
  }

  return loadMap;
}
