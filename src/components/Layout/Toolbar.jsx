export default function Toolbar({ reactFlowInstance }) {
  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ duration: 600, padding: 0.2 });
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Fit View Button */}
          <button
            onClick={handleFitView}
            className="px-4 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan hover:bg-gray-700 transition-all text-sm font-medium flex items-center gap-2"
            title="Fit View (centers and fits all nodes)"
          >
            <span className="text-base">⊡</span>
            <span>Fit View</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-300 flex items-center gap-2">
          <span className="text-neon-cyan">💡</span>
          <span>Hover over nodes/edges to disconnect or reconnect</span>
        </div>
      </div>
    </div>
  );
}
