import BaseNodeWrapper from './BaseNodeWrapper';

export default function UtilityNode(props) {
    const iconColor = props?.data?.equipment?.color || '#00D9FF';

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex items-center justify-center" style={{ color: iconColor }}>
                {/* Utility Icon: Transmission Tower */}
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Tower Structure */}
                    <path d="M12 2l-8 20h16l-8-20z" strokeLinejoin="round" />
                    <path d="M12 6l-4 8h8l-4-8" />

                    {/* Cross Arms */}
                    <line x1="8" y1="10" x2="16" y2="10" strokeLinecap="round" />
                    <line x1="6" y1="14" x2="18" y2="14" strokeLinecap="round" />

                    {/* Insulators/Lines */}
                    <circle cx="6" cy="14" r="1" fill="currentColor" />
                    <circle cx="18" cy="14" r="1" fill="currentColor" />
                    <circle cx="8" cy="10" r="1" fill="currentColor" />
                    <circle cx="16" cy="10" r="1" fill="currentColor" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
