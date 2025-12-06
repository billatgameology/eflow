import { Handle, Position } from 'reactflow';
import BaseNodeWrapper from './BaseNodeWrapper';

export default function ServerNode(props) {
  const racksInRow = Math.min(
    Math.max(props.data?.parameters?.racksInRow || 1, 1),
    50
  );

  // Visual parameters for horizontal layout
  const rackWidth = 12;
  const rackHeight = 24;
  const gap = 2;
  
  const totalWidth = racksInRow * (rackWidth + gap) - gap;
  const viewBoxWidth = Math.max(totalWidth, 40);
  const viewBoxHeight = rackHeight + 4;

  return (
    <BaseNodeWrapper {...props} className="w-[120px] max-w-[120px]">
      <div className="text-gray-300 flex flex-col items-center justify-center w-full px-2">
        {/* Server Rack Icon: Horizontal row of racks */}
        <svg
          width="100%"
          height="50"
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          stroke="currentColor"
          strokeWidth={racksInRow > 10 ? "0.5" : "1.5"}
        >
          {Array.from({ length: racksInRow }).map((_, i) => {
            const x = i * (rackWidth + gap) + (viewBoxWidth - totalWidth) / 2;
            return (
              <g key={i}>
                <rect x={x} y="2" width={rackWidth} height={rackHeight} rx="1" />
                <line x1={x + 2} y1="6" x2={x + rackWidth - 2} y2="6" strokeWidth={racksInRow > 10 ? "0.5" : "1"} />
                <line x1={x + 2} y1="10" x2={x + rackWidth - 2} y2="10" strokeWidth={racksInRow > 10 ? "0.5" : "1"} />
                <line x1={x + 2} y1="14" x2={x + rackWidth - 2} y2="14" strokeWidth={racksInRow > 10 ? "0.5" : "1"} />
                <line x1={x + 2} y1="18" x2={x + rackWidth - 2} y2="18" strokeWidth={racksInRow > 10 ? "0.5" : "1"} />
                {racksInRow <= 10 && (
                   <circle cx={x + rackWidth - 3} cy="4" r="0.5" fill="currentColor" stroke="none" />
                )}
              </g>
            );
          })}
        </svg>
        {racksInRow > 1 && (
          <div className="text-[8px] text-gray-500 mt-0.5 truncate w-full text-center">
            {racksInRow} Racks
          </div>
        )}


        <Handle
          type="source"
          position={Position.Bottom}
          id="profile-link"
          isConnectable={false}
          style={{
            width: 0,
            height: 0,
            opacity: 0,
          }}
        />
      </div>
    </BaseNodeWrapper>
  );
}
