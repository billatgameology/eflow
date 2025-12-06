import { useState } from 'react';
import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function MTSNode(props) {
    const { powerFlowMap } = useSimulationStore();
    const { updateNode } = useDiagramStore();
    const powerInfo = powerFlowMap.get(props.id);
    const [isHovered, setIsHovered] = useState(false);

    // Get the manually selected source from node data (default to primary/0)
    const manualSelection = props.data?.parameters?.selectedSource ?? 0;

    // Find sources by their target handle
    const primarySource = powerInfo?.sources?.find(s => (s.targetHandle || 'input-0') === 'input-0');
    const secondarySource = powerInfo?.sources?.find(s => s.targetHandle === 'input-1');

    // Check power status of each source
    const primaryHasPower = primarySource ? (powerFlowMap.get(primarySource.id)?.isPowered ?? false) : false;
    const secondaryHasPower = secondarySource ? (powerFlowMap.get(secondarySource.id)?.isPowered ?? false) : false;

    // Get colors from sources (or default gray if not connected)
    const primaryColor = primarySource?.color || '#374151';
    const secondaryColor = secondarySource?.color || '#374151';

    // Determine if the currently selected source has power
    const selectedSourceHasPower = manualSelection === 0 ? primaryHasPower : secondaryHasPower;

    // Get the selected source's color for switch arm and output
    const selectedColor = manualSelection === 0 ? primaryColor : secondaryColor;
    const activeColor = selectedSourceHasPower ? selectedColor : '#374151';

    // Handle manual switch toggle
    const handleToggleSwitch = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const newSelection = manualSelection === 0 ? 1 : 0;
        updateNode(props.id, {
            data: {
                ...props.data,
                parameters: {
                    ...props.data.parameters,
                    selectedSource: newSelection,
                },
            },
        });
    };

    // Active source index for visual display (based on manual selection)
    const activeSourceIndex = manualSelection;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <BaseNodeWrapper {...props}>
                <div className="flex flex-col items-center justify-center text-gray-300">
                    {/* MTS Icon: Two inputs merging to one with manual switch */}
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        {/* Input A (Left) - Primary - colored by primary source */}
                        <path 
                            d="M8 4v6" 
                            style={{ 
                                stroke: primaryHasPower ? primaryColor : '#374151',
                                strokeWidth: activeSourceIndex === 0 ? 2.5 : 2
                            }}
                        />
                        {/* Input B (Right) - Secondary - colored by secondary source */}
                        <path 
                            d="M16 4v6" 
                            style={{ 
                                stroke: secondaryHasPower ? secondaryColor : '#374151',
                                strokeWidth: activeSourceIndex === 1 ? 2.5 : 2
                            }}
                        />
                        {/* Switch Arm - Animated - colored by selected source */}
                        <path 
                            d="M12 14l-4-4" 
                            className="transition-all duration-500 ease-in-out"
                            style={{ 
                                transform: activeSourceIndex === 1 ? 'rotate(90deg)' : 'rotate(0deg)', 
                                transformOrigin: '12px 14px',
                                stroke: selectedSourceHasPower ? activeColor : '#6B7280',
                                strokeWidth: 2.5
                            }}
                        />
                        {/* Output - colored by selected source */}
                        <path 
                            d="M12 14v6" 
                            style={{ 
                                stroke: selectedSourceHasPower ? activeColor : '#374151',
                                strokeWidth: selectedSourceHasPower ? 2.5 : 2
                            }}
                        />
                    </svg>
                </div>
            </BaseNodeWrapper>

            {/* Manual Switch Button - shown on hover, mid-right of node */}
            {isHovered && (
                <button
                    onClick={handleToggleSwitch}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center border-2 border-black transition-all duration-200 cursor-pointer z-50 bg-neon-cyan hover:bg-cyan-400"
                    style={{
                        top: '50%',
                        right: '-20px',
                        transform: 'translateY(-50%)',
                        boxShadow: '0 0 12px rgba(0, 217, 255, 0.8)',
                        pointerEvents: 'auto',
                    }}
                    title={`Switch to ${activeSourceIndex === 0 ? 'Secondary' : 'Primary'} source`}
                >
                    {/* Switch/Transfer symbol - double arrows */}
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                    >
                        <path d="M7 16l-4-4 4-4" />
                        <path d="M17 8l4 4-4 4" />
                        <path d="M3 12h18" />
                    </svg>
                </button>
            )}
        </div>
    );
}