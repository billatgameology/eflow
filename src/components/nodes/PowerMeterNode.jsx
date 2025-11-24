import BaseNodeWrapper from './BaseNodeWrapper';

export default function PowerMeterNode(props) {
    const monitoredEdgeId = props.data?.parameters?.monitoredEdgeId;
    const current = props.data?.measurements?.current || 0;
    const voltage = props.data?.measurements?.voltage || 0;
    const power = (current * voltage / 1000).toFixed(2); // kW

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center py-2 w-full">
                {/* Measurements display */}
                <div className="flex flex-col items-center gap-0.5 font-mono">
                    <div className="text-xs text-gray-400 font-bold">
                        {voltage}V
                    </div>
                    <div className="text-xs text-neon-green">
                        {current.toFixed(1)}A
                    </div>
                    <div className="text-sm text-neon-cyan font-bold">
                        {power}kW
                    </div>
                </div>

                {/* Monitoring indicator */}
                {monitoredEdgeId && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse"
                        title={`Monitoring edge: ${monitoredEdgeId.slice(0, 8)}...`} />
                )}
            </div>
        </BaseNodeWrapper>
    );
}
