import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function CircuitBreakerNode(props) {
    const { powerFlowMap, instantaneousLoadMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);
    const isPowered = powerInfo?.isPowered;

    // Calculate measurements
    const voltage = props.data.parameters?.voltage || 120;
    const powerWatts = instantaneousLoadMap?.get(props.id) || 0;
    const current = voltage > 0 ? powerWatts / voltage : 0;
    const ratedAmps = props.data.parameters?.ampRating || props.data.parameters?.current || 0;

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center">
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

                {/* Current Reading */}
                <div className="mt-1 bg-black/80 border border-gray-600 rounded px-1.5 py-0.5 text-[8px] font-mono whitespace-nowrap">
                    <span className={current > ratedAmps ? "text-neon-red" : "text-neon-green"}>
                        {current.toFixed(1)}A
                    </span>
                    <span className="text-gray-500 mx-0.5">/</span>
                    <span className="text-gray-400">{ratedAmps}A</span>
                </div>
            </div>
        </BaseNodeWrapper>
    );
}
