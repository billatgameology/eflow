import BaseNodeWrapper from './BaseNodeWrapper';

import { useSimulationStore } from '../../stores/useSimulationStore';

export default function PDUNode(props) {
    const { powerFlowMap } = useSimulationStore();
    const powerInfo = powerFlowMap.get(props.id);
    const isPowered = powerInfo?.isPowered;

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center">
                {/* PDU Icon: Distribution Cabinet */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isPowered ? "text-white" : "text-gray-400"}>
                    {/* Cabinet Body */}
                    <rect x="4" y="2" width="16" height="20" rx="1" strokeWidth="2" />

                    {/* Header Panel */}
                    <line x1="4" y1="6" x2="20" y2="6" strokeWidth="1" />

                    {/* Breaker Rows */}
                    <path d="M7 9h2" strokeWidth="2" />
                    <path d="M15 9h2" strokeWidth="2" />

                    <path d="M7 12h2" strokeWidth="2" />
                    <path d="M15 12h2" strokeWidth="2" />

                    <path d="M7 15h2" strokeWidth="2" />
                    <path d="M15 15h2" strokeWidth="2" />

                    <path d="M7 18h2" strokeWidth="2" />
                    <path d="M15 18h2" strokeWidth="2" />

                    {/* Center Divider */}
                    <line x1="12" y1="7" x2="12" y2="21" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
