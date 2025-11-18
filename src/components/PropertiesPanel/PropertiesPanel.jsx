import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function PropertiesPanel() {
  const { selectedNodeId, isPropertiesPanelOpen, togglePropertiesPanel } = useUIStore();
  const { nodes } = useDiagramStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!isPropertiesPanelOpen) {
    return (
      <button
        onClick={togglePropertiesPanel}
        className="fixed right-0 top-1/2 bg-gray-900 border border-gray-700 p-2 rounded-l text-gray-400 hover:text-white"
      >
        ←
      </button>
    );
  }

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-neon-green">Properties</h2>
          <button
            onClick={togglePropertiesPanel}
            className="text-gray-400 hover:text-white"
          >
            →
          </button>
        </div>

        {selectedNode ? (
          <div className="text-sm text-gray-300">
            <p>Node ID: {selectedNode.id}</p>
            <p>Type: {selectedNode.type || 'default'}</p>
            <p className="mt-2 text-gray-500">
              Properties editor will be added in Phase 4
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Select an element to edit properties</p>
        )}
      </div>
    </div>
  );
}
