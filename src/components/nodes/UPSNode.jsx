import BaseNodeWrapper from './BaseNodeWrapper';

export default function UPSNode(props) {
    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center text-gray-200">
                {/* UPS Icon: Box with Sine Wave and Plug */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    {/* Sine Wave */}
                    <path d="M8 8c1.5-1.5 2.5-1.5 4 0s2.5 1.5 4 0" />
                    {/* Plug/Connector */}
                    <path d="M9 14h6" />
                    <path d="M10 14v3" />
                    <path d="M14 14v3" />
                    <rect x="10" y="17" width="4" height="2" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
