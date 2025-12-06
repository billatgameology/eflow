import BaseNodeWrapper from './BaseNodeWrapper';
import { useSimulationStore } from '../../stores/useSimulationStore';

// Graph constants
const SVG_WIDTH = 100;
const SVG_HEIGHT = 50;
const PADDING = 8;
const HOURS_MAX = 23;

const hourToX = (hour) =>
  PADDING + (hour / HOURS_MAX) * (SVG_WIDTH - PADDING * 2);

const powerToY = (power, maxPower) => {
  if (maxPower <= 0) return SVG_HEIGHT - PADDING;
  const normalizedPower = Math.min(power / maxPower, 1);
  return PADDING + ((1 - normalizedPower)) * (SVG_HEIGHT - PADDING * 2);
};

const formatPoints = (history, maxPower) =>
  history
    .sort((a, b) => a.hour - b.hour)
    .map((point) => `${hourToX(point.hour)},${powerToY(point.power, maxPower)}`)
    .join(' ');

export default function PowerMeterNode(props) {
    const monitoredEdgeId = props.data?.parameters?.monitoredEdgeId;
    const current = props.data?.measurements?.current || 0;
    const voltage = props.data?.measurements?.voltage || 0;
    const power = (current * voltage / 1000).toFixed(2); // kW
    const history = props.data?.measurements?.history || [];
    
    const { simulationHour, isSimulating } = useSimulationStore();
    
    // Calculate max power for Y-axis scaling (with some headroom)
    const maxPower = history.length > 0 
        ? Math.max(...history.map(h => h.power)) * 1.2 
        : parseFloat(power) * 1.2 || 1;
    
    // Current simulation position on graph
    const currentX = hourToX(simulationHour);
    const currentY = powerToY(parseFloat(power), maxPower);

    return (
        <BaseNodeWrapper {...props}>
            <div className="flex flex-col items-center justify-center py-1 w-full">
                {/* Trend Graph */}
                {history.length > 0 && (
                    <div className="relative mb-1">
                        <svg 
                            width={SVG_WIDTH} 
                            height={SVG_HEIGHT} 
                            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                            className="bg-gray-900/50 rounded"
                        >
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((tick) => {
                                const y = PADDING + ((100 - tick) / 100) * (SVG_HEIGHT - PADDING * 2);
                                return (
                                    <line
                                        key={`grid-${tick}`}
                                        x1={PADDING}
                                        y1={y}
                                        x2={SVG_WIDTH - PADDING}
                                        y2={y}
                                        stroke="rgba(0, 217, 255, 0.1)"
                                        strokeWidth="0.5"
                                        strokeDasharray="2 2"
                                    />
                                );
                            })}
                            
                            {/* Power trend line */}
                            {history.length > 1 && (
                                <polyline
                                    points={formatPoints(history, maxPower)}
                                    fill="none"
                                    stroke="#39FF14"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ filter: 'drop-shadow(0 0 3px rgba(57, 255, 20, 0.5))' }}
                                />
                            )}
                            
                            {/* Current position indicator */}
                            {isSimulating && (
                                <>
                                    {/* Vertical line at current hour */}
                                    <line
                                        x1={currentX}
                                        y1={PADDING}
                                        x2={currentX}
                                        y2={SVG_HEIGHT - PADDING}
                                        stroke="#FFD700"
                                        strokeWidth="1"
                                        strokeDasharray="3 2"
                                        opacity="0.6"
                                    />
                                    {/* Current point marker */}
                                    <circle
                                        cx={currentX}
                                        cy={currentY}
                                        r={3}
                                        fill="#FFD700"
                                        stroke="#111827"
                                        strokeWidth="1"
                                    />
                                </>
                            )}
                            
                            {/* Single point marker when only one data point */}
                            {history.length === 1 && (
                                <circle
                                    cx={hourToX(history[0].hour)}
                                    cy={powerToY(history[0].power, maxPower)}
                                    r={2.5}
                                    fill="#39FF14"
                                    stroke="#111827"
                                    strokeWidth="1"
                                />
                            )}
                        </svg>
                    </div>
                )}
                
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
