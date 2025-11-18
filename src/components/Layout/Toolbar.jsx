import { useSimulationStore } from '../../stores/useSimulationStore';

export default function Toolbar({ reactFlowInstance }) {
  const { isSimulating, startSimulation, stopSimulation } = useSimulationStore();

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-6 py-2">
      <div className="flex items-center gap-3">
        <div className="flex gap-2 border-r border-gray-700 pr-3">
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan transition-colors text-sm"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan transition-colors text-sm"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleFitView}
            className="px-3 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan transition-colors text-sm"
            title="Fit View"
          >
            Fit
          </button>
        </div>

        <button
          onClick={toggleSimulation}
          className={`px-4 py-1 font-semibold rounded transition-all text-sm ${
            isSimulating
              ? 'bg-neon-red text-black shadow-neon-red animate-pulse'
              : 'bg-neon-green text-black hover:bg-neon-cyan'
          }`}
        >
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </button>

        {isSimulating && (
          <span className="text-xs text-neon-green animate-pulse">
            ● Simulation Running
          </span>
        )}
      </div>
    </div>
  );
}
