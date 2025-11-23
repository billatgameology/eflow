import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import NodeProperties from './NodeProperties';
import EdgeProperties from './EdgeProperties';

export default function PropertiesPanel() {
  const { selectedNodeId, selectedEdgeId, isPropertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const { nodes, edges } = useDiagramStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  if (!isPropertiesPanelOpen) {
    return (
      <button
        onClick={togglePropertiesPanel}
        className="fixed right-0 top-1/2 bg-gray-900 border border-gray-700 p-2 rounded-l text-gray-400 hover:text-white hover:bg-gray-800 transition-all z-50"
      >
        ←
      </button>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto h-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-neon-green neon-text">Properties</h2>
          <button
            onClick={togglePropertiesPanel}
            className="text-gray-400 hover:text-white transition-all"
          >
            →
          </button>
        </div>

        {selectedNode ? (
          <NodeProperties node={selectedNode} />
        ) : selectedEdge ? (
          <EdgeProperties edge={selectedEdge} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3 opacity-50">🔧</div>
            <p className="text-gray-500 text-sm">
              Select equipment or connection to edit properties
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
