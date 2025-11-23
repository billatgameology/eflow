import BaseNodeWrapper from './BaseNodeWrapper';

export default function PowerMeterNode(props) {
    const monitoredEdgeId = props.data?.parameters?.monitoredEdgeId;
    const current = props.data?.measurements?.current || 0;
    const voltage = props.data?.measurements?.voltage || 0;
    const power = (current * voltage / 1000).toFixed(2); // kW

    return (
        <BaseNodeWrapper {...props}>
            <div className="text-gray-300 flex flex-col items-center justify-center">
                {/* Power Meter Icon */}
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Meter body - circular gauge */}
                    <circle cx="12" cy="12" r="9" />
                    
                    {/* Display screen */}
                    <rect x="7" y="10" width="10" height="5" rx="0.5" fill="currentColor" fillOpacity="0.1" />
                    
                    {/* Measurement indicator needle - rotates based on current */}
                    <line 
                        x1="12" 
                        y1="12" 
                        x2="12" 
                        y2="6" 
                        strokeWidth="2" 
                        stroke="#00FF9F"
                        transform={`rotate(${Math.min(current * 3, 135)} 12 12)`}
                    />
                    <circle cx="12" cy="12" r="1.5" fill="#00FF9F" />
                    
                    {/* Gauge markers */}
                    <line x1="5" y1="12" x2="6" y2="12" strokeWidth="1" />
                    <line x1="18" y1="12" x2="19" y2="12" strokeWidth="1" />
                    <line x1="12" y1="3" x2="12" y2="4" strokeWidth="1" />
                </svg>
                
                {/* Measurements display */}
                <div className="mt-1 text-center">
                    <div className="text-[9px] text-neon-green font-mono">
                        {current.toFixed(1)}A
                    </div>
                    <div className="text-[8px] text-gray-500 font-mono">
                        {power}kW
                    </div>
                </div>
                
                {/* Monitoring indicator */}
                {monitoredEdgeId && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full animate-pulse" 
                         title={`Monitoring edge: ${monitoredEdgeId.slice(0, 8)}...`} />
                )}
            </div>
        </BaseNodeWrapper>
    );
}
