import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useToastStore } from '../Layout/Toast';
import { EQUIPMENT_CATEGORIES } from '../../data/equipmentDefinitions';
import DualPowerIndicator from './DualPowerIndicator';
import { v4 as uuidv4 } from 'uuid';

export default function BaseNode({ id, data, selected }) {
  const { faultedNodes, toggleNodeFault, powerFlowMap } = useSimulationStore();
  const { copyToClipboard } = useUIStore();
  const { removeNode, addNode, nodes } = useDiagramStore();
  const { addToast } = useToastStore();
  const [isHovered, setIsHovered] = useState(false);
  const isFaulted = faultedNodes.has(id);
  const powerInfo = powerFlowMap.get(id);

  // Check if this is a power generation equipment
  const isPowerGeneration = data.equipment.category === EQUIPMENT_CATEGORIES.GENERATION;

  // Dynamic border and shadow based on state
  const getBorderStyle = () => {
    if (isFaulted) {
      return 'border-neon-red shadow-neon-red';
    }
    if (selected) {
      return 'border-neon-green shadow-neon-green';
    }
    if (powerInfo?.isPowered) {
      return `border-[${powerInfo.color}]`;
    }
    return 'border-gray-600';
  };

  const glowAnimation = selected ? 'animate-pulse-slow' : '';

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nodeToCopy = nodes.find(node => node.id === id);
    if (nodeToCopy) {
      copyToClipboard({
        type: 'node',
        data: JSON.parse(JSON.stringify(nodeToCopy))
      });
      addToast('Node copied', 'success');
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeNode(id);
    addToast('Node deleted', 'info');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative
        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
        border-2 rounded-xl
        min-w-[160px] min-h-[100px]
        ${getBorderStyle()} ${glowAnimation}
        transition-all duration-300 ease-in-out
        hover:border-neon-cyan hover:shadow-neon-cyan
        backdrop-blur-sm
      `}
      style={{
        boxShadow: selected
          ? '0 0 20px rgba(0, 255, 159, 0.5), 0 0 40px rgba(0, 255, 159, 0.3)'
          : isFaulted
          ? '0 0 20px rgba(255, 0, 85, 0.5), 0 0 40px rgba(255, 0, 85, 0.3)'
          : '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Power Source Indicator Background */}
      {powerInfo?.isPowered && !isFaulted && (
        <div
          className="absolute inset-0 rounded-xl opacity-10"
          style={{
            background: `linear-gradient(135deg, ${powerInfo.color}22, transparent)`,
          }}
        />
      )}

      {/* Input Handles */}
      {data.equipment.ports.input > 0 &&
        Array.from({ length: data.equipment.ports.input }).map((_, i) => (
          <Handle
            key={`input-${i}`}
            type="target"
            position={Position.Top}
            id={`input-${i}`}
            className="w-3 h-3 border-2 border-gray-700 transition-all hover:border-neon-cyan"
            style={{
              left: `${((i + 1) / (data.equipment.ports.input + 1)) * 100}%`,
              background: '#00D9FF',
              boxShadow: '0 0 8px rgba(0, 217, 255, 0.6)',
            }}
          />
        ))}

      {/* Main Content */}
      <div className="px-5 py-4 flex flex-col items-center gap-2 relative z-10">
        {/* Equipment Icon */}
        <div
          className="text-4xl drop-shadow-lg"
          style={{
            filter: powerInfo?.isPowered
              ? `drop-shadow(0 0 8px ${powerInfo.color})`
              : 'none',
          }}
        >
          {data.equipment.icon}
        </div>

        {/* Equipment Label */}
        <div className="text-center">
          <span className="text-sm font-bold text-white tracking-wide drop-shadow-md">
            {data.label || data.equipment.label}
          </span>
        </div>

        {/* Voltage Info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-300 font-mono border border-gray-600">
            {data.parameters?.voltage}V
          </span>
          {data.parameters?.phases && (
            <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-300 font-mono border border-gray-600">
              {data.parameters.phases}Ø
            </span>
          )}
        </div>

        {/* Additional Info Badge */}
        {(data.parameters?.kwRating || data.parameters?.kvaRating || data.parameters?.ampRating) && (
          <div className="text-xs text-gray-400 font-mono">
            {data.parameters.kwRating && `${data.parameters.kwRating}kW`}
            {data.parameters.kvaRating && `${data.parameters.kvaRating}kVA`}
            {data.parameters.ampRating && `${data.parameters.ampRating}A`}
          </div>
        )}
      </div>

      {/* Dual Power Source Indicator - for equipment with 2 inputs receiving power from 2 sources */}
      {data.equipment.ports.input === 2 && powerInfo?.sources?.length === 2 && (
        <DualPowerIndicator sources={powerInfo.sources} />
      )}

      {/* Power Source Indicator Box (top-right) - for non-power generation equipment */}
      {!isPowerGeneration && powerInfo?.isPowered && powerInfo?.sources?.length > 0 && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {powerInfo.sources.map((source, idx) => (
            <div
              key={idx}
              className="w-4 h-4 rounded border-2 border-black"
              style={{
                backgroundColor: source.color,
                boxShadow: `0 0 8px ${source.color}`,
              }}
              title={`Powered by: ${source.label}`}
            />
          ))}
        </div>
      )}

      {/* Fault Toggle Button (Alert/Fault Mode) - shown on hover */}
      {isHovered && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleNodeFault(id);
          }}
          className={`
            absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center
            border-2 border-black transition-all duration-200 cursor-pointer z-50
            ${isFaulted
              ? 'bg-neon-red hover:bg-red-600'
              : 'bg-gray-600 hover:bg-neon-red'
            }
          `}
          style={{
            boxShadow: isFaulted
              ? '0 0 12px rgba(255, 0, 85, 0.8)'
              : '0 0 8px rgba(156, 163, 175, 0.6)',
            pointerEvents: 'auto',
          }}
          title={isFaulted ? 'Click to clear fault' : 'Click to inject fault'}
        >
          {/* Alert/Warning symbol */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      )}

      {/* Copy and Delete buttons - bottom right on hover */}
      {isHovered && (
        <div className="absolute -bottom-3 -right-3 flex gap-2 z-50">
          {/* Copy Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleCopy}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-neon-cyan hover:bg-blue-400 border-2 border-black transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: '0 0 12px rgba(0, 217, 255, 0.8)',
              pointerEvents: 'auto',
            }}
            title="Copy node (Ctrl+C)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={handleDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-neon-red hover:bg-red-600 border-2 border-black transition-all duration-200 cursor-pointer"
            style={{
              boxShadow: '0 0 12px rgba(255, 0, 85, 0.8)',
              pointerEvents: 'auto',
            }}
            title="Delete node (Delete)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      )}

      {/* Fault Indicator - permanent when faulted */}
      {isFaulted && !isHovered && (
        <div className="absolute -top-2 -left-2 flex items-center justify-center">
          <div className="w-6 h-6 bg-neon-red rounded-full animate-pulse flex items-center justify-center border-2 border-black">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>
      )}

      {/* Power Source Badge */}
      {data.parameters?.isPowerSource && (
        <div className="absolute -top-2 -left-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-pulse"
            style={{
              backgroundColor: data.equipment.color,
              boxShadow: `0 0 12px ${data.equipment.color}`,
            }}
          >
            <span className="text-xs">⚡</span>
          </div>
        </div>
      )}

      {/* Output Handles */}
      {data.equipment.ports.output > 0 &&
        Array.from({ length: data.equipment.ports.output }).map((_, i) => (
          <Handle
            key={`output-${i}`}
            type="source"
            position={Position.Bottom}
            id={`output-${i}`}
            className="w-3 h-3 border-2 border-gray-700 transition-all hover:border-neon-green"
            style={{
              left: `${((i + 1) / (data.equipment.ports.output + 1)) * 100}%`,
              background: '#00FF9F',
              boxShadow: '0 0 8px rgba(0, 255, 159, 0.6)',
            }}
          />
        ))}
    </div>
  );
}
