import { interpolateValueAtHour } from './loadProfile';

/**
 * Helper to find primary and secondary sources for a transfer switch
 * Primary = input-0 (left handle), Secondary = input-1 (right handle)
 */
function findPrimaryAndSecondarySources(sources) {
  if (!sources || sources.length === 0) {
    return { primary: null, secondary: null };
  }
  
  // Find by explicit targetHandle
  // Default to input-0 if handle is missing
  let primary = sources.find(s => s.targetHandle === 'input-0' || !s.targetHandle);
  let secondary = sources.find(s => s.targetHandle === 'input-1');
  
  // If we found the same source for both (e.g. it had no handle), and we have multiple sources,
  // try to disambiguate.
  if (primary && secondary && primary === secondary) {
    // This shouldn't happen if handles are set correctly, but just in case:
    // If we have >1 sources, assume the second one is secondary
    if (sources.length > 1) {
      secondary = sources.find(s => s !== primary);
    } else {
      // Only 1 source, and it matched both? 
      // If it has no handle, we assumed primary. So unset secondary.
      secondary = null;
    }
  }
  
  return { primary, secondary };
}

/**
 * Determine the active source for an ATS node
 * Primary (input-0) is preferred; switches to secondary (input-1) if primary has no power
 */
function getATSActiveSource(node, incomingSources, powerFlowMap) {
  if (!incomingSources || incomingSources.length === 0) {
    return null;
  }

  const { primary: primarySource, secondary: secondarySource } = findPrimaryAndSecondarySources(incomingSources);

  // Check if primary source has power
  if (primarySource) {
    const primaryPowerInfo = powerFlowMap.get(primarySource.id);
    if (primaryPowerInfo?.isPowered) {
      return primarySource; // Use primary source
    }
  }

  // Primary has no power, use secondary if available
  if (secondarySource) {
    const secondaryPowerInfo = powerFlowMap.get(secondarySource.id);
    if (secondaryPowerInfo?.isPowered) {
      return secondarySource; // Use secondary source
    }
  }

  return null; // No power available
}

/**
 * Determine the active source for an MTS node
 * Based on manual selection stored in node parameters
 */
function getMTSActiveSource(node, incomingSources, powerFlowMap) {
  if (!incomingSources || incomingSources.length === 0) {
    return null;
  }

  const manualSelection = node.data?.parameters?.selectedSource ?? 0;
  const { primary: primarySource, secondary: secondarySource } = findPrimaryAndSecondarySources(incomingSources);

  // Return the manually selected source if it has power
  if (manualSelection === 0 && primarySource) {
    const primaryPowerInfo = powerFlowMap.get(primarySource.id);
    if (primaryPowerInfo?.isPowered) {
      return primarySource;
    }
  } else if (manualSelection === 1 && secondarySource) {
    const secondaryPowerInfo = powerFlowMap.get(secondarySource.id);
    if (secondaryPowerInfo?.isPowered) {
      return secondarySource;
    }
  }

  return null; // Selected source has no power
}

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

  // First pass: Calculate which sources reach each node (without transfer switch logic)
  // This is needed to determine power availability at ATS/MTS inputs
  powerSources.forEach((source) => {
    const visited = new Set();
    const queue = [{ nodeId: source.nodeId, sourceColor: source.color, sourceLabel: source.label, targetHandle: null, fromEdgeId: null }];

    while (queue.length > 0) {
      const { nodeId: currentNodeId, sourceColor, sourceLabel, targetHandle, fromEdgeId } = queue.shift();

      // Skip if already visited from this source
      // For transfer switches, we need to allow the same source to arrive on different handles
      // So include the targetHandle in the visit key for those nodes
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      const isTransferSwitch = currentNode?.type === 'ats' || currentNode?.type === 'mts';
      
      // For transfer switches, determine the actual handle from the incoming edge
      let actualTargetHandle = targetHandle;
      if (isTransferSwitch && fromEdgeId) {
        const incomingEdge = edges.find(e => e.id === fromEdgeId);
        if (incomingEdge?.targetHandle) {
          actualTargetHandle = incomingEdge.targetHandle;
        } else {
          // No explicit targetHandle on edge - infer based on source node position
          // Compare the X position of the source node to the target node
          // Left source = input-0 (primary), Right source = input-1 (secondary)
          const sourceNode = nodes.find(n => n.id === incomingEdge?.source);
          const targetNode = currentNode;
          
          if (sourceNode && targetNode) {
            const sourceX = sourceNode.position?.x ?? 0;
            const targetX = targetNode.position?.x ?? 0;
            // If source is to the left of target (or equal), it's primary
            // We need to compare with OTHER incoming edges to determine left vs right
            const allIncomingEdges = edges.filter(e => e.target === currentNodeId);
            if (allIncomingEdges.length >= 2) {
              // Find all source positions and sort
              const edgesWithPositions = allIncomingEdges.map(e => {
                const srcNode = nodes.find(n => n.id === e.source);
                return { edge: e, x: srcNode?.position?.x ?? 0 };
              }).sort((a, b) => a.x - b.x); // Sort by X position (left to right)
              
              const edgeIndex = edgesWithPositions.findIndex(ep => ep.edge.id === fromEdgeId);
              actualTargetHandle = edgeIndex === 0 ? 'input-0' : `input-${edgeIndex}`;
            } else {
              actualTargetHandle = 'input-0';
            }
          } else {
            actualTargetHandle = 'input-0';
          }
        }
      }
      
      const visitKey = isTransferSwitch 
        ? `${currentNodeId}-${source.id}-${actualTargetHandle || 'input-0'}`
        : `${currentNodeId}-${source.id}`;
      if (visited.has(visitKey)) continue;
      visited.add(visitKey);

      // Skip if node is faulted
      if (faultedNodes.has(currentNodeId)) continue;

      // Get current node (already fetched above)
      if (!currentNode) continue;

      // Mark as powered from this source
      const powerInfo = powerFlowMap.get(currentNodeId);

      // For transfer switches (ATS/MTS), we need to track sources per input handle
      // because the same source could arrive on different handles through different paths
      
      // Check if this source is already tracked (for TS, also check handle)
      const existingSource = powerInfo.sources.find(s => 
        s.id === source.id && (!isTransferSwitch || s.targetHandle === actualTargetHandle)
      );
      
      if (!existingSource) {
        powerInfo.sources.push({
          id: source.id,
          color: sourceColor,
          label: sourceLabel,
          targetHandle: actualTargetHandle, // Track which input handle this source connects to
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

        // Add target to queue with the same source info, including edge id for handle inference
        queue.push({
          nodeId: edge.target,
          targetHandle: edge.targetHandle || null,
          sourceColor: sourceColor,
          sourceLabel: sourceLabel,
          fromEdgeId: edge.id,
        });
      });
    }
  });

  // Second pass: Apply transfer switch logic for ATS and MTS nodes
  // Clear downstream nodes of transfer switches and recalculate with only active source
  const transferSwitchNodes = nodes.filter(n => n.type === 'ats' || n.type === 'mts');
  
  transferSwitchNodes.forEach((tsNode) => {
    const tsPowerInfo = powerFlowMap.get(tsNode.id);
    if (!tsPowerInfo?.sources || tsPowerInfo.sources.length === 0) return;

    // Determine active source based on node type
    let activeSource;
    if (tsNode.type === 'ats') {
      activeSource = getATSActiveSource(tsNode, tsPowerInfo.sources, powerFlowMap);
    } else if (tsNode.type === 'mts') {
      activeSource = getMTSActiveSource(tsNode, tsPowerInfo.sources, powerFlowMap);
    }

    // Only process IMMEDIATE children of the transfer switch
    // Don't traverse the full downstream tree - that causes conflicts with nested transfer switches
    // and complex topologies where the same source reaches nodes through multiple paths
    const outgoingEdges = edges.filter((edge) => edge.source === tsNode.id && !faultedEdges.has(edge.id));
    const immediateChildren = new Set(outgoingEdges.map(e => e.target));

    // For each immediate child, update its power based on the active source
    immediateChildren.forEach((childId) => {
      const childNode = nodes.find(n => n.id === childId);
      const childPowerInfo = powerFlowMap.get(childId);
      if (!childPowerInfo) return;
      
      // If the child is another transfer switch, don't modify its sources
      // It will handle its own source management
      if (childNode?.type === 'ats' || childNode?.type === 'mts') {
        return;
      }

      if (!activeSource) {
        // No active source from this TS - but the child might have other sources
        // Remove sources that came from this TS's inputs
        childPowerInfo.sources = childPowerInfo.sources.filter(s => {
          const isFromTS = tsPowerInfo.sources.some(tsSource => tsSource.id === s.id);
          return !isFromTS;
        });
      } else {
        // Active source exists - replace TS sources with just the active one
        const otherSources = childPowerInfo.sources.filter(s => {
          const isFromTS = tsPowerInfo.sources.some(tsSource => tsSource.id === s.id);
          return !isFromTS;
        });
        
        // Only add the active source if it was reaching this child
        const hadSourceFromTS = childPowerInfo.sources.some(s => 
          tsPowerInfo.sources.some(tsSource => tsSource.id === s.id)
        );
        
        if (hadSourceFromTS) {
          childPowerInfo.sources = [
            ...otherSources,
            {
              id: activeSource.id,
              color: activeSource.color,
              label: activeSource.label,
              targetHandle: null,
            }
          ];
        }
      }

      // Update power status and color
      childPowerInfo.isPowered = childPowerInfo.sources.length > 0;
      if (childPowerInfo.sources.length === 0) {
        childPowerInfo.color = null;
      } else if (childPowerInfo.sources.length === 1) {
        childPowerInfo.color = childPowerInfo.sources[0].color;
      } else {
        childPowerInfo.color = childPowerInfo.sources.map(s => s.color);
      }
    });

    // Also update the transfer switch node itself
    // Keep both sources tracked for the dual power indicator, but set activeSource
    const activePowerInfo = {
      ...tsPowerInfo,
      activeSource: activeSource, // Can be null if selected source has no power
      color: activeSource ? activeSource.color : null,
      isPowered: activeSource !== null, // MTS is only "powered" for output if active source has power
    };
    powerFlowMap.set(tsNode.id, activePowerInfo);
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

  // 2. Propagate Load Upstream (Bottom-Up)
  // We iterate until convergence or max iterations.
  const MAX_ITERATIONS = 20;
  let iterations = 0;
  let converged = false;

  while (!converged && iterations < MAX_ITERATIONS) {
    iterations++;
    converged = true; // Assume converged unless we find a change

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

    const previousLoadMap = new Map(loadMap);

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

        // For ATS/MTS nodes, load only flows through the active/selected source
        // Check if the consumer is a transfer switch
        if (consumerNode.type === 'ats' || consumerNode.type === 'mts') {
          const edgeToConsumer = edges.find(e => e.source === nodeId && e.target === consumerId && !faultedEdges.has(e.id));
          if (!edgeToConsumer) return;
          
          if (incomingEdges.length <= 1) {
            // Only one input, it's active - carry full load
            const consumerLoad = calculateNodeLoad(consumerId, new Set(visited));
            totalLoad += consumerLoad;
            return;
          }
          
          // Find primary/secondary edges by handle or position
          let primaryEdge = incomingEdges.find(e => (e.targetHandle || 'input-0') === 'input-0');
          let secondaryEdge = incomingEdges.find(e => e.targetHandle === 'input-1');
          
          if (!primaryEdge || !secondaryEdge) {
            const edgesWithPos = incomingEdges.map(e => {
              const srcNode = nodes.find(n => n.id === e.source);
              return { edge: e, x: srcNode?.position?.x ?? 0 };
            }).sort((a, b) => a.x - b.x);
            
            primaryEdge = edgesWithPos[0]?.edge;
            secondaryEdge = edgesWithPos[1]?.edge;
          }
          
          const primaryPowered = primaryEdge && powerFlowMap?.get(primaryEdge.source)?.isPowered;
          const secondaryPowered = secondaryEdge && powerFlowMap?.get(secondaryEdge.source)?.isPowered;
          
          let isActiveEdge = false;
          if (consumerNode.type === 'ats') {
            isActiveEdge = primaryPowered 
              ? edgeToConsumer.id === primaryEdge?.id
              : secondaryPowered && edgeToConsumer.id === secondaryEdge?.id;
          } else {
            const selection = consumerNode.data?.parameters?.selectedSource ?? 0;
            isActiveEdge = selection === 0
              ? primaryPowered && edgeToConsumer.id === primaryEdge?.id
              : secondaryPowered && edgeToConsumer.id === secondaryEdge?.id;
          }
          
          if (!isActiveEdge) return;
          
          const consumerLoad = calculateNodeLoad(consumerId, new Set(visited));
          totalLoad += consumerLoad;
          return;
        }
        // For non-transfer-switch consumers, split load among active sources
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
        const newLoad = calculateNodeLoad(node.id);
        const oldLoad = previousLoadMap.get(node.id) || 0;

        if (Math.abs(newLoad - oldLoad) > 0.1) { // 0.1W tolerance
          converged = false;
        }
        loadMap.set(node.id, newLoad);
      }
    });

    // The recursive function above has a flaw: it re-calculates deep nodes many times.
    // But it ensures correct order.
    // Let's use it.
  }

  return loadMap;
}
