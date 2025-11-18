import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useUIStore } from '../../stores/useUIStore';
import { nodeTypes } from '../nodes/nodeTypes';

export default function Canvas({ onInit }) {
  const { nodes, edges, setNodes, setEdges, addEdge: addEdgeToStore, addNode } = useDiagramStore();
  const { selectNode, clearSelection } = useUIStore();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes) => {
      // Handle node position changes, etc.
      // For now, we'll implement a simple version
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const updatedNodes = nodes.map((node) =>
            node.id === change.id
              ? { ...node, position: change.position }
              : node
          );
          setNodes(updatedNodes);
        } else if (change.type === 'remove') {
          const updatedNodes = nodes.filter((node) => node.id !== change.id);
          setNodes(updatedNodes);
        }
      });
    },
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          const updatedEdges = edges.filter((edge) => edge.id !== change.id);
          setEdges(updatedEdges);
        }
      });
    },
    [edges, setEdges]
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
    (event, node) => selectNode(node.id),
    [selectNode]
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

  return (
    <div className="w-full h-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance) => {
          setReactFlowInstance(instance);
          if (onInit) onInit(instance);
        }}
        fitView
      >
        <Background color="#1a1a1a" gap={16} />
        <Controls className="bg-gray-900 border border-gray-700" />
        <MiniMap
          className="bg-gray-900 border border-gray-700"
          nodeColor="#4a5568"
        />
      </ReactFlow>
    </div>
  );
}
