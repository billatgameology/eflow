import { useEffect, useRef } from 'react';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function NodeContextMenu({ nodeId, position, onClose }) {
  const menuRef = useRef(null);
  const { removeNode, nodes, addNode } = useDiagramStore();
  const { toggleNodeFault, faultedNodes } = useSimulationStore();

  const node = nodes.find(n => n.id === nodeId);
  const isFaulted = faultedNodes.has(nodeId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDuplicate = () => {
    if (node) {
      const newNode = {
        ...node,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        data: {
          ...node.data,
          label: `${node.data.label} (Copy)`,
        },
      };
      addNode(newNode);
    }
    onClose();
  };

  const handleToggleFault = () => {
    toggleNodeFault(nodeId);
    onClose();
  };

  const handleDelete = () => {
    removeNode(nodeId);
    onClose();
  };

  if (!node) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl py-2 min-w-[180px] z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-700">
        {node.data.label}
      </div>

      <button
        onClick={handleDuplicate}
        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>📋</span>
        <span>Duplicate</span>
      </button>

      <button
        onClick={handleToggleFault}
        className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>{isFaulted ? '✓' : '⚠️'}</span>
        <span>{isFaulted ? 'Clear Fault' : 'Inject Fault'}</span>
      </button>

      <div className="border-t border-gray-700 my-1"></div>

      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        <span>🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  );
}
