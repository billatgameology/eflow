import BaseNodeWrapper from './BaseNodeWrapper';

export default function PDUNode(props) {
    return (
        <BaseNodeWrapper {...props}>
            <div className="text-gray-300 flex flex-col items-center justify-center">
                {/* PDU Icon: Vertical Strip with Outlets */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="8" y="2" width="8" height="20" rx="1" />
                    {/* Outlets */}
                    <rect x="10" y="5" width="4" height="2" rx="0.5" />
                    <rect x="10" y="9" width="4" height="2" rx="0.5" />
                    <rect x="10" y="13" width="4" height="2" rx="0.5" />
                    <rect x="10" y="17" width="4" height="2" rx="0.5" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
