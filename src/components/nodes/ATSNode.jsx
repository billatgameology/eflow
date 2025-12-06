import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

// Helper to find primary and secondary sources
function findPrimaryAndSecondary(sources) {
    if (!sources || sources.length === 0) return { primary: null, secondary: null };
    
    let primary = sources.find(s => (s.targetHandle || 'input-0') === 'input-0');
    let secondary = sources.find(s => s.targetHandle === 'input-1');
    
    if (!secondary && sources.length > 1 && primary) {
        secondary = sources.find(s => s !== primary);
    }
    if (!primary && sources.length >= 1) {
        primary = sources[0];
        if (sources.length > 1) secondary = sources[1];
    }
    
    return { primary, secondary };
}

export default function ATSNode(props) {
    const { powerFlowMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);

    // Find sources
    const { primary: primarySource, secondary: secondarySource } = findPrimaryAndSecondary(powerInfo?.sources);

    // Check power status of each source
    const primaryHasPower = primarySource ? (powerFlowMap.get(primarySource.id)?.isPowered ?? false) : false;
    const secondaryHasPower = secondarySource ? (powerFlowMap.get(secondarySource.id)?.isPowered ?? false) : false;

    // Get colors from sources (or default gray if not connected)
    const primaryColor = primarySource?.color || '#374151';
    const secondaryColor = secondarySource?.color || '#374151';

    // Determine which source is active based on power availability
    // Primary source (input-0, left) is preferred; if it loses power, switch to secondary (input-1, right)
    const getActiveSourceIndex = () => {
        if (primaryHasPower) {
            return 0; // Use primary source (left)
        }
        if (secondaryHasPower) {
            return 1; // Switch to secondary source (right)
        }
        return -1; // No power available from any source
    };

    const activeSourceIndex = getActiveSourceIndex();

    // Get the active source's color for switch arm and output
    const activeColor = activeSourceIndex === 0 ? primaryColor : (activeSourceIndex === 1 ? secondaryColor : '#374151');

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex items-center justify-center text-gray-300">
                {/* ATS Icon: Two inputs merging to one */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    {/* Input A (Left) - colored by primary source */}
                    <path 
                        d="M8 4v6" 
                        style={{ 
                            stroke: primaryHasPower ? primaryColor : '#374151',
                            strokeWidth: activeSourceIndex === 0 ? 2.5 : 2
                        }}
                    />
                    {/* Input B (Right) - colored by secondary source */}
                    <path 
                        d="M16 4v6" 
                        style={{ 
                            stroke: secondaryHasPower ? secondaryColor : '#374151',
                            strokeWidth: activeSourceIndex === 1 ? 2.5 : 2
                        }}
                    />
                    {/* Switch Arm - colored by active source */}
                    <path 
                        d="M12 14l-4-4" 
                        className="transition-all duration-300"
                        style={{ 
                            transform: activeSourceIndex === 1 ? 'rotate(90deg)' : 'rotate(0deg)', 
                            transformOrigin: '12px 14px',
                            stroke: activeSourceIndex >= 0 ? activeColor : '#6B7280',
                            strokeWidth: 2.5
                        }}
                    />
                    {/* Output - colored by active source */}
                    <path 
                        d="M12 14v6" 
                        style={{ 
                            stroke: activeSourceIndex >= 0 ? activeColor : '#374151',
                            strokeWidth: activeSourceIndex >= 0 ? 2.5 : 2
                        }}
                    />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
