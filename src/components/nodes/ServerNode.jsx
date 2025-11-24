import { Handle, Position } from 'reactflow';
import BaseNodeWrapper from './BaseNodeWrapper';

export default function ServerNode(props) {
  const racksInRow = Math.min(
    Math.max(props.data?.parameters?.racksInRow || 1, 1),
    40
  );

  // Each rack unit - compact spacing
  const rackUnitHeight = 4; // Height per rack in viewBox units
  const totalHeight = racksInRow * rackUnitHeight;
  const svgHeight = Math.max(40, racksInRow * 3); // Minimum 40px, scale up with racks

  return (
    <BaseNodeWrapper {...props} className="w-[120px] max-w-[120px]">
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
          <div className="text-[8px] text-gray-500 mt-0.5 truncate w-full text-center">
            {racksInRow}
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
