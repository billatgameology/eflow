import { Handle, Position } from 'reactflow';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';

const SVG_WIDTH = 100;
const SVG_HEIGHT = 100;
const PADDING = 10;
const HOURS_MAX = 23;

const hourToX = (hour) =>
  PADDING + (hour / HOURS_MAX) * (SVG_WIDTH - PADDING * 2);
const percentageToY = (percentage) =>
  PADDING + ((100 - percentage) / 100) * (SVG_HEIGHT - PADDING * 2);

const interpolateValueAtHour = (points = [], hour = 0) => {
  if (!points.length) return null;
  const sorted = [...points].sort((a, b) => a.hour - b.hour);
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (hour === current.hour) return current.percentage;
    if (hour > current.hour && hour < next.hour) {
      const ratio = (hour - current.hour) / (next.hour - current.hour || 1);
      return current.percentage + ratio * (next.percentage - current.percentage);
    }
  }
  return sorted[sorted.length - 1]?.percentage ?? null;
};

const formatPoints = (points = []) =>
  points
    .sort((a, b) => a.hour - b.hour)
    .map((point) => `${hourToX(point.hour)},${percentageToY(point.percentage)}`)
    .join(' ');

const getStats = (points = []) => {
  if (!points.length) return { avg: 0, peak: 0 };
  const avg = Math.round(points.reduce((sum, p) => sum + p.percentage, 0) / points.length);
  const peak = Math.max(...points.map((p) => p.percentage));
  return { avg, peak };
};

export default function LoadProfileNode({ data }) {
  const { nodes } = useDiagramStore();
  const parentNode = nodes.find((node) => node.id === data.parentNodeId);
  const loadProfile = parentNode?.data?.loadProfile;
  const { simulationHour, isSimulating } = useSimulationStore();
  const { showLoadProfileOverlays } = useUIStore();

  if (!showLoadProfileOverlays) {
    return null;
  }

  if (!parentNode || !loadProfile) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-[10px] text-gray-400 text-center w-[120px]">
        No data
      </div>
    );
  }

  const sortedPoints = [...loadProfile.points].sort((a, b) => a.hour - b.hour);
  const stats = getStats(sortedPoints);
  const simulationValue = interpolateValueAtHour(sortedPoints, simulationHour);
  const simulationX = isSimulating ? hourToX(simulationHour) : null;
  const simulationY =
    isSimulating && simulationValue !== null ? percentageToY(simulationValue) : null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 shadow w-[120px] relative">
      <Handle
        type="target"
        position={Position.Top}
        id="profile-link-target"
        isConnectable={false}
        style={{
          width: 0,
          height: 0,
          opacity: 0,
          top: 0,
        }}
      />
      <div className="relative">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = percentageToY(tick);
            return (
              <line
                key={`grid-${tick}`}
                x1={PADDING}
                y1={y}
                x2={SVG_WIDTH - PADDING}
                y2={y}
                stroke="rgba(229, 231, 235, 0.15)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            );
          })}

          {formatPoints(sortedPoints) && (
            <polyline
              points={formatPoints(sortedPoints)}
              fill="none"
              stroke="#00D9FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))' }}
            />
          )}

          {isSimulating && simulationX !== null && (
            <>
              <line
                x1={simulationX}
                y1={PADDING}
                x2={simulationX}
                y2={SVG_HEIGHT - PADDING}
                stroke="#FFD700"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              {simulationY !== null && (
                <circle
                  cx={simulationX}
                  cy={simulationY}
                  r={5}
                  fill="#FFD700"
                  stroke="#111827"
                  strokeWidth="2"
                />
              )}
            </>
          )}
        </svg>

        {isSimulating && simulationValue !== null && (
          <div className="text-[9px] font-mono text-[#FFD700] text-center mt-1">
            {simulationValue.toFixed(0)}%
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 mt-1">
        <span>Avg {stats.avg}%</span>
        <span>Peak {stats.peak}%</span>
      </div>
    </div>
  );
}
