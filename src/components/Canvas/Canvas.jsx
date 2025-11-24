import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useUIStore } from '../../stores/useUIStore';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { nodeTypes } from '../nodes/nodeTypes';
import { edgeTypes } from '../edges/edgeTypes';
import { cloneLoadProfile } from '../../utils/loadProfile';

const LOAD_PROFILE_OFFSET = 160;

export default function Canvas({ onInit }) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addEdge: addEdgeToStore,
    addNode,
    saveToHistory,
    updateNode,
  } = useDiagramStore();
  const { selectNode, selectEdge, clearSelection, gridType, snapToGrid } = useUIStore();
  const { powerFlowMap } = useSimulationStore();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const dragStartRef = useRef(false);

  const onNodesChange = useCallback(
    (changes) => {
      let needsHistorySave = false;
      let updatedNodes = [...nodes];

      changes.forEach((change) => {
        if (change.type === 'position') {
          // Track drag start
          if (change.dragging && !dragStartRef.current) {
            dragStartRef.current = true;
            saveToHistory();
          }
          // Track drag end
          if (!change.dragging && dragStartRef.current) {
            dragStartRef.current = false;
          }

          // Update position
          if (change.position) {
            updatedNodes = updatedNodes.map((node) =>
              node.id === change.id
                ? { ...node, position: change.position }
                : node
            );

            const movedNode = nodes.find((node) => node.id === change.id);
            if (movedNode?.type === 'server' && movedNode.data?.profileNodeId) {
              updatedNodes = updatedNodes.map((node) =>
                node.id === movedNode.data.profileNodeId
                  ? {
                      ...node,
                      position: {
                        x: change.position.x,
                        y: change.position.y + LOAD_PROFILE_OFFSET,
                      },
                    }
                  : node
              );
            }
          }
        } else if (change.type === 'remove') {
          needsHistorySave = true;
          updatedNodes = updatedNodes.filter((node) => node.id !== change.id);
        } else if (change.type === 'select') {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id
              ? { ...node, selected: change.selected }
              : node
          );
        } else if (change.type === 'dimensions') {
          updatedNodes = updatedNodes.map((node) =>
            node.id === change.id && change.dimensions
              ? { ...node, width: change.dimensions.width, height: change.dimensions.height }
              : node
          );
        }
      });

      if (needsHistorySave) {
        saveToHistory();
      }

      setNodes(updatedNodes);
    },
    [nodes, setNodes, saveToHistory]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      let needsHistorySave = false;
      let updatedEdges = [...edges];

      changes.forEach((change) => {
        if (change.type === 'remove') {
          needsHistorySave = true;
          updatedEdges = updatedEdges.filter((edge) => edge.id !== change.id);
        } else if (change.type === 'select') {
          updatedEdges = updatedEdges.map((edge) =>
            edge.id === change.id
              ? { ...edge, selected: change.selected }
              : edge
          );
        }
      });

      if (needsHistorySave) {
        saveToHistory();
      }

      setEdges(updatedEdges);
    },
    [edges, setEdges, saveToHistory]
  );

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'power',
        animated: false,
      };
      addEdgeToStore(newEdge);
    },
    [addEdgeToStore]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      // If modifier key is pressed, let React Flow handle multi-selection
      // We don't want to override it with our single-select store action
      if (!event.metaKey && !event.ctrlKey) {
        selectNode(node.id);
      } else {
        // Clear the specific selected node ID in UI store since we are in multi-select mode
        // This ensures PropertiesPanel falls back to checking multiple selected nodes
        selectNode(null);
      }
    },
    [selectNode]
  );

  const onEdgeClick = useCallback(
    (event, edge) => selectEdge(edge.id),
    [selectEdge]
  );

  const onPaneClick = useCallback(
    () => clearSelection(),
    [clearSelection]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const equipmentData = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      // Use React Flow's coordinate transformation for accurate positioning
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = uuidv4();
      const isServerNode = equipmentData.type === 'server';
      const newNode = {
        id: newNodeId,
        type: equipmentData.type,
        position,
        data: {
          label: equipmentData.label,
          equipment: equipmentData,
          parameters: { ...equipmentData.defaultParameters },
          loadProfile: equipmentData.loadProfile
            ? cloneLoadProfile(equipmentData.loadProfile)
            : null,
        },
      };

      if (isServerNode) {
        newNode.data.profileNodeId = `${newNodeId}-profile`;
      }

      addNode(newNode);

      if (isServerNode) {
        const profileNodeId = newNode.data.profileNodeId;
        addNode({
          id: profileNodeId,
          type: 'loadProfile',
          position: {
            x: position.x,
            y: position.y + LOAD_PROFILE_OFFSET,
          },
          data: {
            parentNodeId: newNodeId,
          },
          selectable: false,
          draggable: false,
          deletable: false,
        });

        addEdgeToStore({
          id: `${newNodeId}-profile-edge`,
          source: newNodeId,
          target: profileNodeId,
          sourceHandle: 'profile-link',
          targetHandle: 'profile-link-target',
          type: 'relationship',
          selectable: false,
        });
      }
    },
    [reactFlowInstance, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    nodes.forEach((node) => {
      if (node.type !== 'server') return;
      const profileNodeId = node.data?.profileNodeId || `${node.id}-profile`;
      const hasProfileNode = nodes.some((n) => n.id === profileNodeId);
      if (!hasProfileNode) {
        addNode({
          id: profileNodeId,
          type: 'loadProfile',
          position: {
            x: node.position.x,
            y: node.position.y + LOAD_PROFILE_OFFSET,
          },
          data: { parentNodeId: node.id },
          selectable: false,
          draggable: false,
          deletable: false,
        });
      }

      if (node.data?.profileNodeId !== profileNodeId) {
        updateNode(node.id, {
          data: {
            ...node.data,
            profileNodeId,
          },
        });
      }

      const edgeId = `${node.id}-profile-edge`;
      const hasEdge = edges.some((edge) => edge.id === edgeId);
      if (!hasEdge) {
        addEdgeToStore({
          id: edgeId,
          source: node.id,
          target: profileNodeId,
          sourceHandle: 'profile-link',
          targetHandle: 'profile-link-target',
          type: 'relationship',
          selectable: false,
        });
      } else {
        const existingEdge = edges.find((edge) => edge.id === edgeId);
        if (
          existingEdge &&
          (existingEdge.sourceHandle !== 'profile-link' ||
            existingEdge.targetHandle !== 'profile-link-target' ||
            existingEdge.type !== 'relationship')
        ) {
          setEdges(
            edges.map((edge) =>
              edge.id === edgeId
                ? {
                    ...edge,
                    sourceHandle: 'profile-link',
                    targetHandle: 'profile-link-target',
                    type: 'relationship',
                    selectable: false,
                  }
                : edge
            )
          );
        }
      }
    });
  }, [nodes, edges, addNode, addEdgeToStore, updateNode, setEdges]);

  // Map gridType string to BackgroundVariant enum
  const getBackgroundVariant = () => {
    switch (gridType) {
      case 'dots':
        return BackgroundVariant.Dots;
      case 'lines':
        return BackgroundVariant.Lines;
      case 'cross':
        return BackgroundVariant.Cross;
      default:
        return BackgroundVariant.Dots;
    }
  };

  return (
    <div className="w-full h-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          if (onInit) onInit(instance);
        }}
        snapToGrid={snapToGrid}
        snapGrid={[16, 16]}
        fitView
      >
        <Background
          color="#4a5568"
          gap={16}
          variant={getBackgroundVariant()}
        />
        <Controls className="bg-gray-900 border border-gray-700" />
        <MiniMap
          className="bg-gray-950 border-2 border-gray-700 rounded-lg shadow-lg"
          nodeColor={(node) => {
            const powerInfo = powerFlowMap.get(node.id);

            // If powered, use the source color
            if (powerInfo?.isPowered && powerInfo.color) {
              return Array.isArray(powerInfo.color) ? powerInfo.color[0] : powerInfo.color;
            }

            // Default gray for unpowered or disconnected
            return '#4a5568';
          }}
          nodeStrokeColor={(node) => {
            const powerInfo = powerFlowMap.get(node.id);
            if (powerInfo?.isPowered && powerInfo.color) {
              return Array.isArray(powerInfo.color) ? powerInfo.color[0] : powerInfo.color;
            }
            return '#4a5568';
          }}
          nodeStrokeWidth={2}
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{
            backgroundColor: '#0a0a0a',
          }}
        />
      </ReactFlow>
    </div>
  );
}
