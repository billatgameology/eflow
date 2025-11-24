import BaseNodeWrapper from './BaseNodeWrapper';

export default function UtilityNode(props) {
    const iconColor = props?.data?.equipment?.color || '#00D9FF';

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex items-center justify-center" style={{ color: iconColor }}>
                {/* Utility Icon: Stacked Layers */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
