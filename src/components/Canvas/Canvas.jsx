import { useCallback, useRef, useState } from 'react';
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

export default function Canvas({ onInit }) {
  const { nodes, edges, setNodes, setEdges, addEdge: addEdgeToStore, addNode, saveToHistory } = useDiagramStore();
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

      const newNode = {
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

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
