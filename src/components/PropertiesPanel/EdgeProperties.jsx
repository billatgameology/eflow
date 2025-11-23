import { useSimulationStore } from '../../stores/useSimulationStore';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function EdgeProperties({ edge }) {
    const { faultedEdges, toggleEdgeFault } = useSimulationStore();
    const { removeEdge } = useDiagramStore();

    const isDisconnected = faultedEdges.has(edge.id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-700 pb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="text-gray-400">⚡</span>
                    Connection
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                    ID: {edge.id}
                </p>
            </div>

            {/* Connection Status */}
            <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                            Connection Status
                        </span>
                        <div
                            onClick={() => toggleEdgeFault(edge.id)}
                            className={`
                relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out
                ${!isDisconnected ? 'bg-neon-green' : 'bg-gray-600'}
              `}
                        >
                            <div
                                className={`
                  absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300
                  ${!isDisconnected ? 'translate-x-6' : 'translate-x-0'}
                `}
                            />
                        </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                        {!isDisconnected
                            ? 'Connection is active and conducting power.'
                            : 'Connection is physically present but electrically disconnected.'}
                    </p>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => removeEdge(edge.id)}
                    className="w-full py-2 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-200 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span>🗑️</span>
                    Delete Connection
                </button>
            </div>

            {/* Source / Target Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <span className="text-gray-500 block mb-1">Source</span>
                    <span className="text-gray-300 font-mono truncate block" title={edge.source}>
                        {edge.source}
                    </span>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <span className="text-gray-500 block mb-1">Target</span>
                    <span className="text-gray-300 font-mono truncate block" title={edge.target}>
                        {edge.target}
                    </span>
                </div>
            </div>
        </div>
    );
}
