import { getSmoothStepPath } from 'reactflow';
import { useUIStore } from '../../stores/useUIStore';

export default function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}) {
  const { showLoadProfileOverlays } = useUIStore();
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  if (!showLoadProfileOverlays) {
    return null;
  }

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#94A3B8"
        strokeWidth={selected ? 2 : 1.5}
        strokeDasharray="6 4"
        opacity={0.8}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="16"
        style={{ pointerEvents: 'stroke' }}
      />
    </>
  );
}
