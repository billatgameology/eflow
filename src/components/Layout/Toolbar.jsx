import { useUIStore } from '../../stores/useUIStore';

export default function Toolbar({ reactFlowInstance }) {
  const { gridType, setGridType, snapToGrid, toggleSnapToGrid } = useUIStore();

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ duration: 600, padding: 0.2 });
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleFitView}
            className="px-4 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan hover:bg-gray-700 transition-all text-sm font-medium flex items-center gap-2"
            title="Fit View (centers and fits all nodes)"
          >
            <span className="text-base">⊡</span>
            <span>Fit View</span>
          </button>

          <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded p-1">
            <button
              onClick={() => setGridType('dots')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${gridType === 'dots' ? 'bg-neon-cyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
              title="Dot Grid"
            >
              Dots
            </button>
            <button
              onClick={() => setGridType('lines')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${gridType === 'lines' ? 'bg-neon-cyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
              title="Line Grid"
            >
              Grid
            </button>
            <button
              onClick={() => setGridType('cross')}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${gridType === 'cross' ? 'bg-neon-cyan text-black' : 'text-gray-300 hover:bg-gray-700'}`}
              title="Cross Grid"
            >
              Cross
            </button>
          </div>

          <button
            onClick={toggleSnapToGrid}
            className={`px-4 py-1.5 border rounded text-sm font-medium flex items-center gap-2 transition-all ${snapToGrid ? 'bg-neon-cyan text-black border-neon-cyan' : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-neon-cyan hover:bg-gray-700'}`}
            title="Toggle Snap to Grid"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Snap to Grid</span>
          </button>
        </div>

        <div className="text-sm text-gray-300 flex items-center gap-2">
          <span className="text-neon-cyan">💡</span>
          <span>Hover over nodes/edges to disconnect or reconnect</span>
        </div>
      </div>
    </div>
  );
}
