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
  selected,
}) {
  const { faultedEdges, toggleEdgeFault, powerFlowMap } = useSimulationStore();
  const { nodes, removeEdge } = useDiagramStore();
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
  // Get the source node's power info to determine the edge color
  const sourcePowerInfo = source ? powerFlowMap.get(source) : null;
  const targetPowerInfo = target ? powerFlowMap.get(target) : null;

  // Edge is powered if source is powered and edge is not faulted
  const isPowered = sourcePowerInfo?.isPowered && !isFaulted;

  // Use the power source color from the source node
  let edgeColor = '#4A5568'; // Default gray

  if (isFaulted) {
    edgeColor = '#FF0055';
  } else if (isPowered && sourcePowerInfo?.sources?.length > 0) {
    edgeColor = sourcePowerInfo.sources[0].color;
  }

  const strokeWidth = isFaulted ? 3 : isPowered ? 2.5 : 1.5;

  // Calculate filter for glow effect
  const getFilter = () => {
    if (selected) {
      return `drop-shadow(0 0 5px ${edgeColor}) drop-shadow(0 0 10px ${edgeColor})`;
    }
    if (isFaulted) {
      return 'drop-shadow(0 0 4px #FF0055)';
    }
    if (isPowered) {
      return `drop-shadow(0 0 4px ${edgeColor})`;
    }
    return 'none';
  };

  return (
    <g>
      <path
        id={id}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          fill: 'none',
          filter: getFilter(),
          transition: 'all 0.3s ease',
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
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
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

      {/* Fault indicator - permanent when faulted */}
      {isFaulted && (
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
