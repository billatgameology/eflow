import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function CircuitBreakerNode(props) {
    const { powerFlowMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);
    const isPowered = powerInfo?.isPowered;

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex items-center justify-center">
                {/* Circuit Breaker Icon: Square with Switch */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isPowered ? "text-neon-green" : "text-gray-400"}>
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M12 4v4" />
                    <path d="M12 16v4" />
                    {/* Switch arm - angled if open (not powered), straight if closed (powered) */}
                    {isPowered ? (
                        <path d="M12 8v8" />
                    ) : (
                        <path d="M12 16l6-8" />
                    )}
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
