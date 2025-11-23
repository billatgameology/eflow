import { useDiagramStore } from '../../stores/useDiagramStore';

export default function AlignmentPanel({ selectedNodes }) {
    const { nodes, setNodes, saveToHistory } = useDiagramStore();

    const handleAlign = (alignment) => {
        if (selectedNodes.length < 2) return;

        saveToHistory();

        let targetValue;

        switch (alignment) {
            case 'top':
                targetValue = Math.min(...selectedNodes.map(n => n.position.y));
                break;
            case 'bottom':
                targetValue = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 0)));
                break;
            case 'left':
                targetValue = Math.min(...selectedNodes.map(n => n.position.x));
                break;
            case 'right':
                targetValue = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 0)));
                break;
            case 'centerX':
                const minX = Math.min(...selectedNodes.map(n => n.position.x));
                const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 0)));
                targetValue = minX + (maxX - minX) / 2;
                break;
            case 'centerY':
                const minY = Math.min(...selectedNodes.map(n => n.position.y));
                const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 0)));
                targetValue = minY + (maxY - minY) / 2;
                break;
        }

        setNodes(
            nodes.map((n) => {
                if (n.selected) {
                    let newPos = { ...n.position };

                    switch (alignment) {
                        case 'top':
                            newPos.y = targetValue;
                            break;
                        case 'bottom':
                            newPos.y = targetValue - (n.height || 0);
                            break;
                        case 'left':
                            newPos.x = targetValue;
                            break;
                        case 'right':
                            newPos.x = targetValue - (n.width || 0);
                            break;
                        case 'centerX':
                            newPos.x = targetValue - (n.width || 0) / 2;
                            break;
                        case 'centerY':
                            newPos.y = targetValue - (n.height || 0) / 2;
                            break;
                    }
                    return { ...n, position: newPos };
                }
                return n;
            })
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-700 pb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="text-neon-cyan">⚏</span>
                    Alignment
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">
                    {selectedNodes.length} items selected
                </p>
            </div>

            {/* Alignment Controls */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleAlign('left')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Left"
                    >
                        <span className="border-l-2 border-gray-400 h-4 w-3 block"></span>
                        <span className="text-xs text-gray-300">Left</span>
                    </button>
                    <button
                        onClick={() => handleAlign('right')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Right"
                    >
                        <span className="border-r-2 border-gray-400 h-4 w-3 block"></span>
                        <span className="text-xs text-gray-300">Right</span>
                    </button>
                    <button
                        onClick={() => handleAlign('top')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Top"
                    >
                        <span className="border-t-2 border-gray-400 w-4 h-3 block"></span>
                        <span className="text-xs text-gray-300">Top</span>
                    </button>
                    <button
                        onClick={() => handleAlign('bottom')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Bottom"
                    >
                        <span className="border-b-2 border-gray-400 w-4 h-3 block"></span>
                        <span className="text-xs text-gray-300">Bottom</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => handleAlign('centerX')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Center Horizontal"
                    >
                        <span className="border-l border-r border-gray-400 w-4 h-4 block relative">
                            <span className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 transform -translate-x-1/2"></span>
                        </span>
                        <span className="text-xs text-gray-300">Center X</span>
                    </button>
                    <button
                        onClick={() => handleAlign('centerY')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1"
                        title="Align Center Vertical"
                    >
                        <span className="border-t border-b border-gray-400 w-4 h-4 block relative">
                            <span className="absolute left-0 right-0 top-1/2 h-px bg-gray-400 transform -translate-y-1/2"></span>
                        </span>
                        <span className="text-xs text-gray-300">Center Y</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
