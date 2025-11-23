import { useMemo } from 'react';
import BaseNodeWrapper from './BaseNodeWrapper';
import { cloneLoadProfile } from '../../utils/loadProfile';
import { useSimulationStore } from '../../stores/useSimulationStore';

const MINI_CHART_WIDTH = 120;
const MINI_CHART_HEIGHT = 46;
const MINI_CHART_PADDING = 6;
const HOURS_MAX = 23;

const formatMiniChartPoints = (points = []) => {
  if (!points.length) return '';

  const chartWidth = MINI_CHART_WIDTH - MINI_CHART_PADDING * 2;
  const chartHeight = MINI_CHART_HEIGHT - MINI_CHART_PADDING * 2;

  return points
    .map((point) => {
      const x =
        MINI_CHART_PADDING + (point.hour / HOURS_MAX) * chartWidth;
      const y =
        MINI_CHART_PADDING +
        ((100 - point.percentage) / 100) * chartHeight;

      return `${x},${y}`;
    })
    .join(' ');
};

const getProfileStats = (points = []) => {
  if (!points.length) {
    return { average: 0, peak: 0 };
  }

  const average = Math.round(
    points.reduce((sum, point) => sum + point.percentage, 0) / points.length
  );
  const peak = Math.max(...points.map((point) => point.percentage));

  return { average, peak };
};

const getValueAtHour = (points = [], hour = 0) => {
  if (!points.length) return null;
  const sorted = [...points].sort((a, b) => a.hour - b.hour);

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (hour === current.hour) {
      return current.percentage;
    }

    if (hour > current.hour && hour < next.hour) {
      const ratio = (hour - current.hour) / (next.hour - current.hour || 1);
      return (
        current.percentage + ratio * (next.percentage - current.percentage)
      );
    }
  }

  return sorted[sorted.length - 1]?.percentage ?? null;
};

const hourToMiniX = (hour) => {
  const chartWidth = MINI_CHART_WIDTH - MINI_CHART_PADDING * 2;
  return MINI_CHART_PADDING + (hour / HOURS_MAX) * chartWidth;
};

const percentageToMiniY = (percentage) => {
  const chartHeight = MINI_CHART_HEIGHT - MINI_CHART_PADDING * 2;
  return (
    MINI_CHART_PADDING +
    ((100 - percentage) / 100) * chartHeight
  );
};

export default function ServerNode(props) {
  const racksInRow = Math.min(
    Math.max(props.data?.parameters?.racksInRow || 1, 1),
    40
  );

  const loadProfile = useMemo(() => {
    if (!props.data?.loadProfile) return null;
    return cloneLoadProfile(props.data.loadProfile);
  }, [props.data?.loadProfile]);

  const sortedPoints = useMemo(() => {
    if (!loadProfile?.points) return [];
    return [...loadProfile.points].sort((a, b) => a.hour - b.hour);
  }, [loadProfile]);

  const miniChartPoints = formatMiniChartPoints(sortedPoints);
  const profileStats = getProfileStats(sortedPoints);
  const { isSimulating, simulationHour } = useSimulationStore();
  const simulationValue = useMemo(
    () => getValueAtHour(sortedPoints, simulationHour),
    [sortedPoints, simulationHour]
  );
  const simulationX = isSimulating ? hourToMiniX(simulationHour) : null;
  const simulationY =
    isSimulating && simulationValue !== null
      ? percentageToMiniY(simulationValue)
      : null;
  // Each rack unit - compact spacing
  const rackUnitHeight = 4; // Height per rack in viewBox units
  const totalHeight = racksInRow * rackUnitHeight;
  const svgHeight = Math.max(40, racksInRow * 3); // Minimum 40px, scale up with racks

  return (
    <BaseNodeWrapper {...props}>
      <div className="text-gray-300 flex flex-col items-center justify-center w-full px-2">
        {/* Server Rack Icon: Stacked squares representing each rack */}
        <svg
          width="40"
          height={svgHeight}
          viewBox={`0 0 24 ${totalHeight}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {/* Generate one square per rack */}
          {Array.from({ length: racksInRow }).map((_, i) => {
            const y = i * rackUnitHeight;
            return (
              <g key={i}>
                {/* Rack unit square */}
                <rect x="5" y={y} width="14" height={rackUnitHeight - 0.2} rx="0.3" />
                {/* Horizontal divider line */}
                <line x1="5" y1={y + rackUnitHeight / 2} x2="19" y2={y + rackUnitHeight / 2} />
                {/* Status lights */}
                <circle cx="8" cy={y + rackUnitHeight / 4} r="0.4" fill="currentColor" />
                <circle cx="10" cy={y + rackUnitHeight / 4} r="0.4" fill="currentColor" />
              </g>
            );
          })}
        </svg>
        {racksInRow > 1 && (
          <div className="text-[8px] text-gray-500 mt-0.5">{racksInRow}</div>
        )}

        {loadProfile && (
          <div className="w-full mt-3 p-2 bg-gray-900/80 border border-gray-700 rounded-lg shadow-inner">
            <svg
              width={MINI_CHART_WIDTH}
              height={MINI_CHART_HEIGHT}
              viewBox={`0 0 ${MINI_CHART_WIDTH} ${MINI_CHART_HEIGHT}`}
              className="w-full"
            >
              {/* Background grid */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const y =
                  MINI_CHART_PADDING +
                  ((100 - tick) / 100) * (MINI_CHART_HEIGHT - MINI_CHART_PADDING * 2);
                return (
                  <line
                    key={`grid-${tick}`}
                    x1={MINI_CHART_PADDING}
                    y1={y}
                    x2={MINI_CHART_WIDTH - MINI_CHART_PADDING}
                    y2={y}
                    stroke="rgba(229, 231, 235, 0.12)"
                    strokeWidth="0.5"
                    strokeDasharray="2 3"
                  />
                );
              })}

              {/* Load path */}
              {miniChartPoints && (
                <polyline
                  points={miniChartPoints}
                  fill="none"
                  stroke="#00D9FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Simulation indicator */}
              {isSimulating && simulationX !== null && (
                <>
                  <line
                    x1={simulationX}
                    y1={MINI_CHART_PADDING}
                    x2={simulationX}
                    y2={MINI_CHART_HEIGHT - MINI_CHART_PADDING}
                    stroke="#FFD700"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {simulationY !== null && (
                    <circle
                      cx={simulationX}
                      cy={simulationY}
                      r={4}
                      fill="#FFD700"
                      stroke="#111827"
                      strokeWidth="1.5"
                    />
                  )}
                </>
              )}
            </svg>
            {isSimulating && simulationValue !== null && (
              <div className="text-[10px] font-mono text-[#FFD700] text-center mt-1">
                Sim {simulationHour.toString().padStart(2, '0')}h • {simulationValue.toFixed(0)}%
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1">
              <span>Avg {profileStats.average}%</span>
              <span>Peak {profileStats.peak}%</span>
            </div>
          </div>
        )}
      </div>
    </BaseNodeWrapper>
  );
}
