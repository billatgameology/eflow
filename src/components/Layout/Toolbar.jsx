import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function Toolbar({ reactFlowInstance }) {
  const {
    gridType,
    setGridType,
    snapToGrid,
    toggleSnapToGrid,
    showLoadProfileOverlays,
    toggleLoadProfileOverlays,
  } = useUIStore();
  const { nodes, setNodes, saveToHistory } = useDiagramStore();
  const {
    isSimulating,
    simulationHour,
    startSimulation,
    pauseSimulation,
  } = useSimulationStore();

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ duration: 600, padding: 0.2 });
    }
  };

  const getSelectedNodes = () => nodes.filter((n) => n.selected);

  const handleAlignTop = () => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;

    const minY = Math.min(...selected.map((n) => n.position.y));

    saveToHistory();
    setNodes(
      nodes.map((n) => {
        if (n.selected) {
          return { ...n, position: { ...n.position, y: minY } };
        }
        return n;
      })
    );
  };

  const handleAlignBottom = () => {
    const selected = getSelectedNodes();
    if (selected.length < 2) return;

    const maxBottom = Math.max(...selected.map((n) => n.position.y + (n.height || 0)));

    saveToHistory();
    setNodes(
      nodes.map((n) => {
        if (n.selected) {
          return { ...n, position: { ...n.position, y: maxBottom - (n.height || 0) } };
        }
        return n;
      })
    );
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

          <div className="h-6 w-px bg-gray-700 mx-1" />

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

          <button
            type="button"
            onClick={toggleLoadProfileOverlays}
            className={`px-4 py-1.5 border rounded text-sm font-medium flex items-center gap-2 transition-all ${
              showLoadProfileOverlays
                ? 'bg-neon-cyan text-black border-neon-cyan'
                : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-neon-cyan hover:bg-gray-700'
            }`}
            title="Toggle Load Profile Overlays"
          >
            <span role="img" aria-label="chart">
              🗠
            </span>
            <span>{showLoadProfileOverlays ? 'Hide' : 'Show'} Graph</span>
          </button>

          <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-2 py-1">
            <button
              type="button"
              onClick={startSimulation}
              disabled={isSimulating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isSimulating
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-neon-green/80 text-black hover:bg-neon-green'
              }`}
              title="Start Simulation"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={pauseSimulation}
              disabled={!isSimulating}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                !isSimulating
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-900 hover:bg-white'
              }`}
              title="Pause Simulation"
            >
              ■
            </button>
            <div className="px-2 text-xs font-mono text-gray-300">
              {simulationHour.toString().padStart(2, '0')}:00
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-300 flex items-center gap-2">
          <span className="text-neon-cyan">💡</span>
          <span>Hover over nodes/edges to disconnect or reconnect</span>
        </div>
      </div>
    </div>
  );
}
