import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function ATSNode(props) {
    const { powerFlowMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);

    // Determine which source is active (simplified logic: prefer source A if available)
    // In a real simulation, this would be determined by the simulation engine
    const activeSourceIndex = powerInfo?.sources?.length > 0 ? 0 : -1;

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex items-center justify-center text-gray-300">
                {/* ATS Icon: Two inputs merging to one */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    {/* Input A (Left) */}
                    <path d="M8 4v6" className={activeSourceIndex === 0 ? "text-neon-cyan" : "text-gray-600"} />
                    {/* Input B (Right) */}
                    <path d="M16 4v6" className={activeSourceIndex === 1 ? "text-neon-magenta" : "text-gray-600"} />
                    {/* Switch Arm */}
                    <path d="M12 14l-4-4" className="transition-all duration-300"
                        style={{ transform: activeSourceIndex === 1 ? 'rotate(90deg)' : 'rotate(0deg)', transformOrigin: '12px 14px' }}
                    />
                    {/* Output */}
                    <path d="M12 14v6" className={powerInfo?.isPowered ? "text-neon-green" : "text-gray-600"} />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
