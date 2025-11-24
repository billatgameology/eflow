import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

export default function SwitchgearNode(props) {
    const { powerFlowMap, instantaneousLoadMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);
    const isPowered = powerInfo?.isPowered;

    // Calculate measurements
    const voltage = props.data.parameters?.voltage || 480; // Default 480V for switchgear
    const powerWatts = instantaneousLoadMap?.get(props.id) || 0;
    // 3-phase calculation? P = V * I * sqrt(3). 
    // For simplicity, let's assume single phase equivalent or just P = V*I for the "toy" aspect unless requested.
    // User said "Power should be calculated automatically with voltage and current".
    // Usually P = V*A.
    const current = voltage > 0 ? powerWatts / voltage : 0;
    const powerKW = powerWatts / 1000;

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center gap-1 w-full px-1">
                {/* Switchgear Icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isPowered ? "text-neon-green" : "text-gray-400"}>
                    <rect x="2" y="2" width="20" height="20" rx="2" />
                    <path d="M12 2v20" />
                    <path d="M2 12h20" />
                    <circle cx="12" cy="12" r="3" />
                </svg>

                {/* Power Meter */}
                <div className="bg-black/80 border border-gray-600 rounded p-1 w-full text-[8px] font-mono text-neon-cyan shadow-inner">
                    <div className="flex justify-between px-1">
                        <span className="text-gray-400">V</span>
                        <span>{voltage}</span>
                    </div>
                    <div className="flex justify-between px-1">
                        <span className="text-gray-400">A</span>
                        <span>{current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 mt-0.5 pt-0.5 px-1 font-bold text-white">
                        <span className="text-gray-400">kW</span>
                        <span>{powerKW.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </BaseNodeWrapper>
    );
}
