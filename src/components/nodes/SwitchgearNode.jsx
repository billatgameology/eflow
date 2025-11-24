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
                {/* Switchgear Icon: Input -> Bus -> Breakers -> Outputs */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className={isPowered ? "text-neon-green" : "text-gray-500"}>
                    {/* Main Busbar (Horizontal) */}
                    <path d="M4 12h32" strokeWidth="2.5" />

                    {/* Input Feeder (Top) */}
                    <path d="M20 2v10" strokeWidth="2" />
                    <circle cx="20" cy="2" r="1.5" fill="currentColor" />

                    {/* Output Feeders with Breaker Symbols */}
                    {/* Feeder 1 */}
                    <path d="M10 12v4" />
                    <path d="M10 24v6" />
                    <rect x="7" y="16" width="6" height="8" rx="1" strokeWidth="1.5" /> {/* Breaker Box */}
                    <path d="M10 18v4" strokeWidth="1" /> {/* Switch handle */}

                    {/* Feeder 2 */}
                    <path d="M20 12v4" />
                    <path d="M20 24v6" />
                    <rect x="17" y="16" width="6" height="8" rx="1" strokeWidth="1.5" />
                    <path d="M20 18v4" strokeWidth="1" />

                    {/* Feeder 3 */}
                    <path d="M30 12v4" />
                    <path d="M30 24v6" />
                    <rect x="27" y="16" width="6" height="8" rx="1" strokeWidth="1.5" />
                    <path d="M30 18v4" strokeWidth="1" />
                </svg>

                {/* Power Meter */}
                <div className="bg-black/80 border border-gray-600 rounded p-1 w-full text-[8px] font-mono shadow-inner">
                    <div className="flex justify-between px-1">
                        <span className="text-gray-500">V</span>
                        <span className="text-gray-300">{voltage}</span>
                    </div>
                    <div className="flex justify-between px-1">
                        <span className="text-gray-500">A</span>
                        <span className="text-neon-green">{current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 mt-0.5 pt-0.5 px-1 font-bold">
                        <span className="text-gray-500">kW</span>
                        <span className="text-neon-cyan">{powerKW.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </BaseNodeWrapper>
    );
}
