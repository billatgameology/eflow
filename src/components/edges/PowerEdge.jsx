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
  const { nodes, edges, removeEdge, addNode } = useDiagramStore();
  const isFaulted = faultedEdges.has(id);
  const [isHovered, setIsHovered] = useState(false);

  // Get the actual edge for ID comparison in transfer switch logic
  const currentEdge = edges.find(e => e.id === id);

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
  const sourceNode = source ? nodes.find(n => n.id === source) : null;
  const targetNode = target ? nodes.find(n => n.id === target) : null;
  const sourcePowerInfo = source ? powerFlowMap.get(source) : null;
  const targetPowerInfo = target ? powerFlowMap.get(target) : null;

  // Check if this edge is actually flowing power
  // For edges going into transfer switches, only the active input flows power
  const isFlowingPower = (() => {
    if (!sourcePowerInfo?.isPowered || isFaulted) return false;
    
    // Check if target is a transfer switch
    if (targetNode?.type === 'ats' || targetNode?.type === 'mts') {
      // Get incoming edges and sort by source node X position (leftmost = primary)
      const incomingEdges = edges.filter(e => e.target === target);
      if (incomingEdges.length === 0) return false;
      if (incomingEdges.length === 1) return true; // Only one input, must be active
      
      // Find primary and secondary edges based on source position
      let primaryEdge = incomingEdges.find(e => (e.targetHandle || 'input-0') === 'input-0');
      let secondaryEdge = incomingEdges.find(e => e.targetHandle === 'input-1');
      
      // If handles not explicit, sort by source node X position
      if (!primaryEdge || !secondaryEdge) {
        const edgesWithPos = incomingEdges.map(e => {
          const srcNode = nodes.find(n => n.id === e.source);
          return { edge: e, x: srcNode?.position?.x ?? 0 };
        }).sort((a, b) => a.x - b.x);
        
        primaryEdge = edgesWithPos[0]?.edge;
        secondaryEdge = edgesWithPos[1]?.edge;
      }
      
      const primaryHasPower = primaryEdge ? powerFlowMap.get(primaryEdge.source)?.isPowered : false;
      const secondaryHasPower = secondaryEdge ? powerFlowMap.get(secondaryEdge.source)?.isPowered : false;
      
      if (targetNode.type === 'ats') {
        // ATS: primary is preferred, secondary only if primary has no power
        if (primaryHasPower) {
          return currentEdge?.id === primaryEdge?.id;
        } else if (secondaryHasPower) {
          return currentEdge?.id === secondaryEdge?.id;
        }
        return false;
      } else {
        // MTS: based on manual selection
        const manualSelection = targetNode.data?.parameters?.selectedSource ?? 0;
        if (manualSelection === 0 && primaryHasPower) {
          return currentEdge?.id === primaryEdge?.id;
        } else if (manualSelection === 1 && secondaryHasPower) {
          return currentEdge?.id === secondaryEdge?.id;
        }
        return false;
      }
    }
    
    return true; // Non-transfer-switch targets always flow if source is powered
  })();

  // Edge is powered if source is powered and edge is not faulted
  const isPowered = sourcePowerInfo?.isPowered && !isFaulted;

  // Use the power source color from the source node
  // For ATS/MTS nodes, use the activeSource color if available
  let edgeColor = '#4A5568'; // Default gray

  if (isFaulted) {
    edgeColor = '#FF0055';
  } else if (isFlowingPower) {
    // Check if source is a transfer switch with an active source
    if ((sourceNode?.type === 'ats' || sourceNode?.type === 'mts') && sourcePowerInfo?.activeSource) {
      edgeColor = sourcePowerInfo.activeSource.color;
    } else if (sourcePowerInfo?.sources?.length > 0) {
      edgeColor = sourcePowerInfo.sources[0].color;
    }
  }

  const strokeWidth = isFaulted ? 3 : isFlowingPower ? 2.5 : 1.5;

  // Calculate filter for glow effect
  const getFilter = () => {
    if (selected) {
      return `drop-shadow(0 0 5px ${edgeColor}) drop-shadow(0 0 10px ${edgeColor})`;
    }
    if (isFaulted) {
      return 'drop-shadow(0 0 4px #FF0055)';
    }
    if (isFlowingPower) {
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

      {/* Animated flow particles - only when power is flowing through this edge */}
      {isFlowingPower && !isFaulted && (
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
