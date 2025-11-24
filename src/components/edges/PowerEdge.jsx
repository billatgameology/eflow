import { useState } from 'react';
import { getSmoothStepPath } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { v4 as uuidv4 } from 'uuid';
import { equipmentDefinitions } from '../../data/equipmentDefinitions';

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
  const { nodes, removeEdge, addNode } = useDiagramStore();
  const isFaulted = faultedEdges.has(id);
  const [isHovered, setIsHovered] = useState(false);

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

  // Find power meters monitoring this edge
  const powerMeters = nodes.filter(
    node => node.type === 'powerMeter' && node.data?.parameters?.monitoredEdgeId === id
  );

  // Handle adding power meter
  const handleAddPowerMeter = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const powerMeterEquipment = equipmentDefinitions.powerMeter;

    // Create power meter node near the edge midpoint
    const meterNode = {
      id: uuidv4(),
      type: 'powerMeter',
      position: {
        x: labelX + 60, // Offset to the right of the edge
        y: labelY - 40, // Offset above the edge
      },
      data: {
        label: 'Power Meter',
        equipment: powerMeterEquipment,
        parameters: {
          ...powerMeterEquipment.defaultParameters,
          monitoredEdgeId: id, // Link to this edge
        },
        measurements: {
          current: 0,
          voltage: 0,
          power: 0,
        },
      },
    };

    addNode(meterNode);
  };

  return (
    <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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
        (() => {
          // Calculate approximate path length (Manhattan distance)
          const length = Math.abs(sourceX - targetX) + Math.abs(sourceY - targetY);
          // Constant speed: 100 pixels per second
          const speed = 100;
          const duration = Math.max(length / speed, 1); // Minimum 1s duration

          return (
            <>
              <circle r="4" fill={edgeColor} stroke="#fff" strokeWidth="1">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} />
              </circle>
              <circle r="4" fill={edgeColor} stroke="#fff" strokeWidth="1" opacity="0.7">
                <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={edgePath} begin={`${duration / 2}s`} />
              </circle>
            </>
          );
        })()
      )}

      {/* Power meter connection lines */}
      {powerMeters.map(meter => {
        const meterCenterX = meter.position.x + (meter.width || 200) / 2;
        const meterCenterY = meter.position.y + (meter.height || 150) / 2;

        return (
          <g key={`meter-${meter.id}`}>
            {/* Line from edge midpoint to meter */}
            <path
              d={`M ${labelX} ${labelY} L ${meterCenterX} ${meterCenterY}`}
              stroke="#00FF9F"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              opacity="0.6"
            />
            {/* Indicator circle at edge midpoint */}
            <circle
              cx={labelX}
              cy={labelY}
              r="4"
              fill="#00FF9F"
              stroke="#000"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Add Power Meter Button - shows on hover */}
      {isHovered && !isFaulted && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <circle
            r="12"
            fill="#00D9FF"
            stroke="#000"
            strokeWidth="2"
            style={{ cursor: 'pointer', pointerEvents: 'all' }}
            onClick={handleAddPowerMeter}
            onMouseDown={(e) => e.stopPropagation()}
            className="hover:fill-cyan-400 transition-all"
          />
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fill="#000"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
            onClick={handleAddPowerMeter}
          >
            📊
          </text>
        </g>
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
