import { useState } from 'react';
import { getSmoothStepPath } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function PowerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  target,
  source,
}) {
  const { faultedEdges, toggleEdgeFault, powerFlowMap } = useSimulationStore();
  const { nodes } = useDiagramStore();
  const [isHovered, setIsHovered] = useState(false);
  const isFaulted = faultedEdges.has(id);

  // Use smooth step path for 90-degree angled connections
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20, // Rounded corners
  });

  // Determine edge color based on power flow
  // Check if the target node is powered and get its power source color
  const targetPowerInfo = target ? powerFlowMap.get(target) : null;
  const isPowered = targetPowerInfo?.isPowered && !isFaulted;

  // Use the power source color if available, otherwise default colors
  let edgeColor = '#4A5568'; // Default gray

  if (isFaulted) {
    edgeColor = '#FF0055';
  } else if (isPowered && targetPowerInfo?.sources?.length > 0) {
    edgeColor = targetPowerInfo.sources[0].color;
  }

  const strokeWidth = isFaulted ? 3 : isPowered ? 2.5 : 1.5;

  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <path
        id={id}
        className={isPowered && !isFaulted ? 'animate-pulse-slow' : ''}
        style={{
          stroke: edgeColor,
          strokeWidth,
          fill: 'none',
          filter: isPowered && !isFaulted
            ? `drop-shadow(0 0 4px ${edgeColor})`
            : isFaulted
            ? 'drop-shadow(0 0 4px #FF0055)'
            : 'none',
        }}
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Invisible wider path for better hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ pointerEvents: 'stroke' }}
      />

      {/* Animated flow particles - only when powered */}
      {isPowered && !isFaulted && (
        <>
          <circle r="4" fill={edgeColor} stroke="#fff" strokeWidth="1">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
          </circle>
          <circle r="4" fill={edgeColor} stroke="#fff" strokeWidth="1" opacity="0.7">
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="1s" />
          </circle>
        </>
      )}

      {/* Fault Toggle Button - shown on hover */}
      {isHovered && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <circle
            r="12"
            fill={isFaulted ? '#FF0055' : '#4A5568'}
            stroke="#000"
            strokeWidth="2"
            className="cursor-pointer transition-all"
            style={{
              filter: isFaulted
                ? 'drop-shadow(0 0 8px rgba(255, 0, 85, 0.8))'
                : 'drop-shadow(0 0 6px rgba(156, 163, 175, 0.6))',
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleEdgeFault(id);
            }}
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fill="#fff"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {isFaulted ? '✓' : '✕'}
          </text>
          <title>{isFaulted ? 'Click to reconnect' : 'Click to disconnect'}</title>
        </g>
      )}

      {/* Fault indicator - permanent when faulted and not hovered */}
      {isFaulted && !isHovered && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <circle r="8" fill="#FF0055" stroke="#000" strokeWidth="2" className="animate-pulse" />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            fill="#fff"
            fontWeight="bold"
          >
            ✕
          </text>
        </g>
      )}
    </g>
  );
}
