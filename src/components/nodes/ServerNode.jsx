import BaseNodeWrapper from './BaseNodeWrapper';

export default function ServerNode(props) {
    return (
        <BaseNodeWrapper {...props}>
            <div className="text-gray-300 flex flex-col items-center justify-center">
                {/* Server Rack Icon: Stack of Rectangles */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <line x1="5" y1="7" x2="19" y2="7" />
                    <line x1="5" y1="11" x2="19" y2="11" />
                    <line x1="5" y1="15" x2="19" y2="15" />
                    <line x1="5" y1="19" x2="19" y2="19" />
                    {/* Status lights */}
                    <circle cx="8" cy="5" r="0.5" fill="currentColor" />
                    <circle cx="8" cy="9" r="0.5" fill="currentColor" />
                    <circle cx="8" cy="13" r="0.5" fill="currentColor" />
                    <circle cx="8" cy="17" r="0.5" fill="currentColor" />
                </svg>
            </div>
        </BaseNodeWrapper>
    );
}
