import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useSimulationStore } from '../../stores/useSimulationStore';

const SVG_WIDTH = 400;
const SVG_HEIGHT = 250;
const PADDING = 32;
const HOURS_AXIS_MAX = 24;
const HOURS_DATA_MAX = 23;
const GRID_COLOR = '#00D9FF';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round = (value, precision = 2) =>
  Number.parseFloat(value.toFixed(precision));

const normalizePoint = (point) => ({
  hour: round(clamp(point?.hour ?? 0, 0, HOURS_DATA_MAX), 2),
  percentage: round(clamp(point?.percentage ?? 50, 0, 100), 1),
});

const normalizePoints = (points = []) => {
  const sanitized = (points || []).map((point) => normalizePoint(point));

  if (!sanitized.some((point) => point.hour === 0)) {
    sanitized.push({ hour: 0, percentage: 50 });
  }

  if (!sanitized.some((point) => point.hour === 23)) {
    sanitized.push({ hour: 23, percentage: 50 });
  }

  return sanitized.sort((a, b) => a.hour - b.hour);
};

const hourToX = (hour) =>
  PADDING + (clamp(hour, 0, HOURS_AXIS_MAX) / HOURS_AXIS_MAX) * (SVG_WIDTH - PADDING * 2);
const percentageToY = (percentage) =>
  PADDING + ((100 - clamp(percentage, 0, 100)) / 100) * (SVG_HEIGHT - PADDING * 2);

const getValueAtHour = (points, hour) => {
  if (!points.length && hour === undefined) return null;
  const sorted = [...points].sort((a, b) => a.hour - b.hour);

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (hour === current.hour) {
      return current.percentage;
    }

    if (hour > current.hour && hour < next.hour) {
      const ratio = (hour - current.hour) / (next.hour - current.hour || 1);
      const interpolated =
        current.percentage + ratio * (next.percentage - current.percentage);
      return round(interpolated, 1);
    }
  }

  return sorted[sorted.length - 1]?.percentage ?? null;
};

export default function LoadProfileEditor({
  points = [],
  onPointsChange,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { simulationHour, isSimulating } = useSimulationStore();

  const normalizedPoints = useMemo(
    () => normalizePoints(points),
    [points]
  );

  const selectedIndex = useMemo(() => {
    if (!selectedSignature) return null;
    const idx = normalizedPoints.findIndex(
      (point) =>
        point.hour === selectedSignature.hour &&
        point.percentage === selectedSignature.percentage
    );
    return idx >= 0 ? idx : null;
  }, [normalizedPoints, selectedSignature]);

  const selectedPoint =
    selectedIndex !== null ? normalizedPoints[selectedIndex] : null;

  const commitPoints = useCallback(
    (nextPoints, selectionOverride) => {
      if (!onPointsChange) return;
      const normalized = normalizePoints(nextPoints);
      onPointsChange(normalized);

      if (selectionOverride === null) {
        setSelectedSignature(null);
      } else if (selectionOverride) {
        setSelectedSignature(normalizePoint(selectionOverride));
      }
    },
    [onPointsChange]
  );

  const getCoordinatesFromEvent = useCallback((event) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const chartWidth = SVG_WIDTH - PADDING * 2;
    const chartHeight = SVG_HEIGHT - PADDING * 2;

    const relativeX = clamp(event.clientX - rect.left, 0, rect.width);
    const relativeY = clamp(event.clientY - rect.top, 0, rect.height);

    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;

    const svgX = relativeX * scaleX;
    const svgY = relativeY * scaleY;

    const rawX = svgX - PADDING;
    const rawY = svgY - PADDING;

    const x = clamp(rawX, 0, chartWidth);
    const y = clamp(rawY, 0, chartHeight);

    const hour = clamp((x / chartWidth) * HOURS_AXIS_MAX, 0, HOURS_DATA_MAX);
    const percentage = clamp(100 - (y / chartHeight) * 100, 0, 100);

    return {
      hour: round(hour, 2),
      percentage: round(percentage, 1),
      x: x + PADDING,
      y: y + PADDING,
    };
  }, []);

  const handleSvgClick = (event) => {
    if (disabled) return;
    const coords = getCoordinatesFromEvent(event);
    if (!coords) return;

    const newPoint = normalizePoint(coords);
    commitPoints([...normalizedPoints, newPoint], newPoint);
  };

  const handlePointMouseDown = (event, index) => {
    event.stopPropagation();
    if (disabled) return;
    const point = normalizedPoints[index];
    setSelectedSignature({ hour: point.hour, percentage: point.percentage });
    setIsDragging(true);
  };

  const handlePointClick = (event, index) => {
    event.stopPropagation();
    if (disabled) return;
    const point = normalizedPoints[index];
    setSelectedSignature({ hour: point.hour, percentage: point.percentage });
  };

  const handlePointerMove = (event) => {
    const coords = getCoordinatesFromEvent(event);
    if (!coords) return;
    setHoverPosition(coords);

    if (disabled || !isDragging || selectedIndex === null) return;

    const current = normalizedPoints[selectedIndex];
    const isEndpoint = current.hour === 0 || current.hour === 23;
    const updatedPoint = normalizePoint({
      hour: isEndpoint ? current.hour : coords.hour,
      percentage: coords.percentage,
    });

    const updatedPoints = normalizedPoints.map((point, idx) =>
      idx === selectedIndex ? updatedPoint : point
    );

    commitPoints(updatedPoints, updatedPoint);
  };

  const handlePointerLeave = () => {
    setHoverPosition(null);
    setIsDragging(false);
  };

  const handleDeleteSelected = () => {
    if (selectedIndex === null) return;
    const target = normalizedPoints[selectedIndex];
    if (target.hour === 0 || target.hour === 23) return;

    const nextPoints = normalizedPoints.filter((_, idx) => idx !== selectedIndex);
    commitPoints(nextPoints, null);
  };

  const handleManualUpdate = (field, value) => {
    if (selectedIndex === null || value === '') return;
    const nextValue = Number(value);
    if (Number.isNaN(nextValue)) return;

    const current = normalizedPoints[selectedIndex];
    const isEndpoint = current.hour === 0 || current.hour === 23;

    if (field === 'hour' && isEndpoint) {
      return;
    }

    const updatedPoint = normalizePoint({
      ...current,
      [field]: nextValue,
    });

    const nextPoints = normalizedPoints.map((point, idx) =>
      idx === selectedIndex ? updatedPoint : point
    );

    commitPoints(nextPoints, updatedPoint);
  };

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('mouseleave', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('mouseleave', stopDragging);
    };
  }, []);

  const hourTicks = useMemo(
    () => Array.from({ length: HOURS_AXIS_MAX / 4 + 1 }, (_, idx) => idx * 4),
    []
  );
  const percentTicks = [0, 25, 50, 75, 100];

  const polylinePoints = normalizedPoints
    .map(
      (point) => `${hourToX(point.hour)},${percentageToY(point.percentage)}`
    )
    .join(' ');

  const hoverX = hoverPosition ? hourToX(hoverPosition.hour) : null;
  const hoverY = hoverPosition ? percentageToY(hoverPosition.percentage) : null;
  const simulationValue = useMemo(
    () => getValueAtHour(normalizedPoints, simulationHour),
    [normalizedPoints, simulationHour]
  );
  const simulationX = isSimulating ? hourToX(simulationHour) : null;
  const simulationY =
    isSimulating && simulationValue !== null
      ? percentageToY(simulationValue)
      : null;

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl border border-gray-700 bg-gray-900/70 p-4">
        <div className="relative">
              {(hoverPosition || isSimulating) && (
                <div className="absolute top-0 right-0 z-10 text-xs font-mono text-gray-200 bg-gray-900/80 px-3 py-1 rounded-bl-lg border border-gray-700 space-y-0.5 text-right">
                  {hoverPosition && (
                    <div>
                      <span>Hover {hoverPosition.hour.toFixed(2)}h</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span>{hoverPosition.percentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {isSimulating && (
                    <div className="text-neon-cyan">
                      <span>Sim {simulationHour.toString().padStart(2, '0')}h</span>
                      {simulationValue !== null && (
                        <>
                          <span className="mx-2 text-gray-500">•</span>
                          <span>{simulationValue.toFixed(1)}%</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width="100%"
                height={SVG_HEIGHT}
                className={`select-none ${disabled ? 'opacity-60' : ''}`}
                onClick={handleSvgClick}
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
              >
                {/* Grid lines */}
                {hourTicks.map((tick) => {
                  const x =
                    PADDING + (tick / HOURS_AXIS_MAX) * (SVG_WIDTH - PADDING * 2);
                  return (
                    <line
                      key={`vtick-${tick}`}
                      x1={x}
                      y1={PADDING}
                      x2={x}
                      y2={SVG_HEIGHT - PADDING}
                      stroke={GRID_COLOR}
                      strokeOpacity={0.12}
                      strokeWidth={1}
                    />
                  );
                })}

                {percentTicks.map((tick) => {
                  const y =
                    PADDING +
                    ((100 - tick) / 100) * (SVG_HEIGHT - PADDING * 2);
                  return (
                    <line
                      key={`htick-${tick}`}
                      x1={PADDING}
                      y1={y}
                      x2={SVG_WIDTH - PADDING}
                      y2={y}
                      stroke={GRID_COLOR}
                      strokeOpacity={0.12}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Axes */}
                <line
                  x1={PADDING}
                  y1={SVG_HEIGHT - PADDING}
                  x2={SVG_WIDTH - PADDING}
                  y2={SVG_HEIGHT - PADDING}
                  stroke="#E5E7EB"
                  strokeWidth={1.5}
                />
                <line
                  x1={PADDING}
                  y1={PADDING}
                  x2={PADDING}
                  y2={SVG_HEIGHT - PADDING}
                  stroke="#E5E7EB"
                  strokeWidth={1.5}
                />

                {/* Polyline */}
                {polylinePoints && (
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={GRID_COLOR}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.7))',
                    }}
                  />
                )}

                {/* Points */}
                {normalizedPoints.map((point, index) => {
                  const x = hourToX(point.hour);
                  const y = percentageToY(point.percentage);
                  const isSelected = selectedIndex === index;
                  const isEndpoint = point.hour === 0 || point.hour === 23;
                  const fill = isSelected
                    ? '#FFA500'
                    : isEndpoint
                    ? '#3B82F6'
                    : '#FF0055';

                  return (
                    <g key={`${point.hour}-${index}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 7 : 5}
                        fill={fill}
                        stroke="#111827"
                        strokeWidth={1.5}
                        className="cursor-pointer transition-all duration-300"
                        onMouseDown={(event) => handlePointMouseDown(event, index)}
                        onClick={(event) => handlePointClick(event, index)}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={12}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseDown={(event) => handlePointMouseDown(event, index)}
                        onClick={(event) => handlePointClick(event, index)}
                      />
                    </g>
                  );
                })}

            {/* Crosshair */}
            {hoverX !== null && hoverY !== null && (
              <>
                <line
                  x1={hoverX}
                      y1={PADDING}
                      x2={hoverX}
                      y2={SVG_HEIGHT - PADDING}
                      stroke="#6B7280"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <line
                      x1={PADDING}
                      y1={hoverY}
                      x2={SVG_WIDTH - PADDING}
                      y2={hoverY}
                      stroke="#6B7280"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                />
              </>
            )}

            {/* Simulation timeline */}
            {isSimulating && simulationX !== null && (
              <>
                <line
                  x1={simulationX}
                  y1={PADDING}
                  x2={simulationX}
                  y2={SVG_HEIGHT - PADDING}
                  stroke="#FFD700"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                {simulationY !== null && (
                  <>
                    <circle
                      cx={simulationX}
                      cy={simulationY}
                      r={5}
                      fill="#FFD700"
                      stroke="#111827"
                      strokeWidth={2}
                    />
                    <text
                      x={simulationX + 8}
                      y={simulationY - 8}
                      className="text-[10px] font-mono"
                      fill="#FFD700"
                    >
                      {simulationValue?.toFixed(1)}%
                    </text>
                  </>
                )}
              </>
            )}

                {/* Hour labels */}
                {hourTicks.map((tick) => {
                  const x =
                    PADDING + (tick / HOURS_AXIS_MAX) * (SVG_WIDTH - PADDING * 2);
                  return (
                    <text
                      key={`xlabel-${tick}`}
                      x={x}
                      y={SVG_HEIGHT - PADDING + 18}
                      className="fill-gray-400 text-[10px] font-mono"
                      textAnchor="middle"
                    >
                      {tick}
                    </text>
                  );
                })}

                {/* Percentage labels */}
                {percentTicks.map((tick) => {
                  const y =
                    PADDING +
                    ((100 - tick) / 100) * (SVG_HEIGHT - PADDING * 2);
                  return (
                    <text
                      key={`ylabel-${tick}`}
                      x={PADDING - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-gray-400 text-[10px] font-mono"
                    >
                      {tick}%
                    </text>
                  );
                })}
              </svg>

              {disabled && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900/70 text-sm text-gray-400 font-medium backdrop-blur-sm">
                  Enable load profile editing to add points
                </div>
              )}
            </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Hour
          </label>
          <input
            type="number"
            min="0"
            max="23"
            step="0.25"
            value={selectedPoint ? selectedPoint.hour : ''}
            onChange={(event) => handleManualUpdate('hour', event.target.value)}
            disabled={
              !selectedPoint ||
              selectedPoint.hour === 0 ||
              selectedPoint.hour === 23
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan disabled:opacity-40"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            Percentage
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={selectedPoint ? selectedPoint.percentage : ''}
            onChange={(event) =>
              handleManualUpdate('percentage', event.target.value)
            }
            disabled={!selectedPoint}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green disabled:opacity-40"
          />
        </div>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={
            !selectedPoint || selectedPoint.hour === 0 || selectedPoint.hour === 23
          }
          className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-700 text-red-300 hover:text-white hover:border-red-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Delete Point
        </button>
      </div>
    </div>
  );
}
