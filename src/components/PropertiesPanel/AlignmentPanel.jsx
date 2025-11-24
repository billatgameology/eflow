import { useDiagramStore } from '../../stores/useDiagramStore';

const EXPANSION_DELTA = 100;

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

    const handleDistribute = (direction, expandBy = 0) => {
        if (selectedNodes.length < 3) return;

        saveToHistory();

        // Sort nodes by position
        const sortedNodes = [...selectedNodes].sort((a, b) => {
            if (direction === 'horizontal') {
                return a.position.x - b.position.x;
            } else {
                return a.position.y - b.position.y;
            }
        });

        if (direction === 'horizontal') {
            // Get the bounds
            const firstNode = sortedNodes[0];
            const lastNode = sortedNodes[sortedNodes.length - 1];
            const startX = firstNode.position.x;
            const endX = lastNode.position.x + (lastNode.width || 0);
            const currentSpan = endX - startX;
            const targetSpan = currentSpan + expandBy;
            
            let targetStart = startX;
            let targetEnd = endX;

            if (expandBy !== 0) {
                const center = startX + currentSpan / 2;
                targetStart = center - targetSpan / 2;
                targetEnd = center + targetSpan / 2;
            }
            
            // Calculate total width of all nodes
            const totalNodesWidth = sortedNodes.reduce((sum, node) => sum + (node.width || 0), 0);
            
            // Calculate total available space and gap
            const totalSpace = targetEnd - targetStart;
            const totalGapSpace = totalSpace - totalNodesWidth;
            const gap = totalGapSpace / (sortedNodes.length - 1);

            // Build position map
            const positionMap = new Map();
            let currentX = targetStart;
            
            sortedNodes.forEach((node, index) => {
                const nodeWidth = node.width || 0;
                
                if (index === 0) {
                    positionMap.set(node.id, targetStart);
                    currentX = targetStart + nodeWidth + gap;
                    return;
                }

                if (index === sortedNodes.length - 1) {
                    positionMap.set(node.id, targetEnd - nodeWidth);
                    return;
                }

                positionMap.set(node.id, currentX);
                currentX = currentX + nodeWidth + gap;
            });
            
            setNodes(
                nodes.map((n) => {
                    if (positionMap.has(n.id)) {
                        const newX = positionMap.get(n.id);
                        if (newX !== n.position.x) {
                            return {
                                ...n,
                                position: {
                                    ...n.position,
                                    x: newX
                                }
                            };
                        }
                    }
                    return n;
                })
            );
        } else {
            // Get the bounds
            const firstNode = sortedNodes[0];
            const lastNode = sortedNodes[sortedNodes.length - 1];
            const startY = firstNode.position.y;
            const endY = lastNode.position.y + (lastNode.height || 0);
            const currentSpan = endY - startY;
            const targetSpan = currentSpan + expandBy;

            let targetStart = startY;
            let targetEnd = endY;

            if (expandBy !== 0) {
                const center = startY + currentSpan / 2;
                targetStart = center - targetSpan / 2;
                targetEnd = center + targetSpan / 2;
            }
            
            // Calculate total height of all nodes
            const totalNodesHeight = sortedNodes.reduce((sum, node) => sum + (node.height || 0), 0);
            
            // Calculate total available space and gap
            const totalSpace = targetEnd - targetStart;
            const totalGapSpace = totalSpace - totalNodesHeight;
            const gap = totalGapSpace / (sortedNodes.length - 1);

            // Build position map
            const positionMap = new Map();
            let currentY = targetStart;
            
            sortedNodes.forEach((node, index) => {
                const nodeHeight = node.height || 0;
                
                if (index === 0) {
                    positionMap.set(node.id, targetStart);
                    currentY = targetStart + nodeHeight + gap;
                    return;
                }

                if (index === sortedNodes.length - 1) {
                    positionMap.set(node.id, targetEnd - nodeHeight);
                    return;
                }

                positionMap.set(node.id, currentY);
                currentY = currentY + nodeHeight + gap;
            });
            
            setNodes(
                nodes.map((n) => {
                    if (positionMap.has(n.id)) {
                        const newY = positionMap.get(n.id);
                        if (newY !== n.position.y) {
                            return {
                                ...n,
                                position: {
                                    ...n.position,
                                    y: newY
                                }
                            };
                        }
                    }
                    return n;
                })
            );
        }
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

                {/* Distribution Controls */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                        Distribute
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleDistribute('horizontal')}
                            disabled={selectedNodes.length < 3}
                            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Distribute Horizontally"
                        >
                            <div className="flex gap-1 items-center">
                                <span className="w-1 h-3 bg-gray-400"></span>
                                <span className="w-1 h-3 bg-gray-400"></span>
                                <span className="w-1 h-3 bg-gray-400"></span>
                            </div>
                            <span className="text-xs text-gray-300">Horizontal</span>
                        </button>
                        <button
                            onClick={() => handleDistribute('vertical')}
                            disabled={selectedNodes.length < 3}
                            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Distribute Vertically"
                        >
                            <div className="flex flex-col gap-1 items-center">
                                <span className="h-1 w-3 bg-gray-400"></span>
                                <span className="h-1 w-3 bg-gray-400"></span>
                                <span className="h-1 w-3 bg-gray-400"></span>
                            </div>
                            <span className="text-xs text-gray-300">Vertical</span>
                        </button>
                    </div>
                    {selectedNodes.length < 3 && (
                        <p className="text-xs text-gray-600 mt-2 text-center">
                            Select 3+ items to distribute
                        </p>
                    )}

                    <div className="mt-4">
                        <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                            Expand & Distribute (+100px)
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleDistribute('horizontal', EXPANSION_DELTA)}
                                disabled={selectedNodes.length < 3}
                                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Expand Horizontal Spacing"
                            >
                                <div className="flex gap-1 items-center">
                                    <span className="w-1 h-3 bg-gray-400"></span>
                                    <span className="w-4 h-px bg-gray-500"></span>
                                    <span className="w-1 h-3 bg-gray-400"></span>
                                </div>
                                <span className="text-xs text-gray-300">Expand Horizontal</span>
                            </button>
                            <button
                                onClick={() => handleDistribute('vertical', EXPANSION_DELTA)}
                                disabled={selectedNodes.length < 3}
                                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors flex flex-col items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Expand Vertical Spacing"
                            >
                                <div className="flex flex-col gap-1 items-center">
                                    <span className="h-1 w-3 bg-gray-400"></span>
                                    <span className="h-4 w-px bg-gray-500"></span>
                                    <span className="h-1 w-3 bg-gray-400"></span>
                                </div>
                                <span className="text-xs text-gray-300">Expand Vertical</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
