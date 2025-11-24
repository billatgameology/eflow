import { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useToastStore } from '../Layout/Toast';
import { EQUIPMENT_CATEGORIES } from '../../data/equipmentDefinitions';
import DualPowerIndicator from './DualPowerIndicator';

export default function BaseNodeWrapper({ id, data, selected, children, className = '' }) {
  const { faultedNodes, toggleNodeFault, powerFlowMap, instantaneousLoadMap } = useSimulationStore();
  const { copyToClipboard } = useUIStore();
  const { removeNode, nodes } = useDiagramStore();
  const { addToast } = useToastStore();
  const updateNodeInternals = useUpdateNodeInternals();
  const [isHovered, setIsHovered] = useState(false);
  const isFaulted = faultedNodes.has(id);
  const powerInfo = powerFlowMap.get(id);

  // Update node internals when ports change
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, data.equipment?.ports]);

  // Check if this is a power generation equipment
  const isPowerGeneration = data.equipment?.category === EQUIPMENT_CATEGORIES.GENERATION;

  // Dynamic border and shadow based on state
  const getBorderStyle = () => {
    if (isFaulted) {
      return 'border-neon-red shadow-neon-red';
    }
    if (selected) {
      return ''; // Will be handled by inline style
    }
    if (powerInfo?.isPowered) {
      return `border-[${powerInfo.color}]`;
    }
    return 'border-gray-600';
  };

  // Get hover color based on power source
  const getHoverColor = () => {
    if (isPowerGeneration) {
      return data.equipment?.color || '#00D9FF';
    }
    if (powerInfo?.isPowered && powerInfo.color) {
      return Array.isArray(powerInfo.color) ? powerInfo.color[0] : powerInfo.color;
    }
    return '#00D9FF'; // Default cyan
  };

  const hoverColor = getHoverColor();

  // Convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0, 217, 255, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative
        bg-gray-900 
        border-2 rounded-xl
        min-w-[100px] min-h-[100px]
        flex flex-col items-center justify-center
        ${getBorderStyle()}
        transition-all duration-300 ease-in-out
        backdrop-blur-sm
        ${className}
      `}
      style={{
        borderColor: selected
          ? hoverColor
          : isHovered && !isFaulted
            ? hoverColor
            : undefined,
        boxShadow: isFaulted
          ? '0 0 20px rgba(255, 0, 85, 0.5), 0 0 40px rgba(255, 0, 85, 0.3)'
          : (selected || isHovered)
            ? `0 0 20px ${hexToRgba(hoverColor, 0.5)}, 0 0 40px ${hexToRgba(hoverColor, 0.3)}`
            : '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Power Source Indicator Background */}
      {powerInfo?.isPowered && !isFaulted && (
        <div
          className="absolute inset-0 rounded-xl opacity-10 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${Array.isArray(powerInfo.color) ? powerInfo.color[0] : powerInfo.color}22, transparent)`,
          }}
        />
      )}

      {/* Input Handles */}
      {data.equipment?.ports?.input > 0 &&
        Array.from({ length: data.equipment.ports.input }).map((_, i) => (
          <Handle
            key={`input-${i}`}
            type="target"
            position={Position.Top}
            id={`input-${i}`}
            className="w-5 h-5 border-2 border-gray-700 transition-colors hover:border-neon-cyan rounded-full"
            style={{
              left: `${((i + 1) / (data.equipment.ports.input + 1)) * 100}%`,
              transform: 'translateX(-50%)',
              background: '#00D9FF',
              boxShadow: '0 0 8px rgba(0, 217, 255, 0.6)',
            }}
          />
        ))}

      {/* Main Content (Symbol) */}
      <div className="p-2 flex flex-col items-center gap-1 relative z-10 w-full h-full justify-center">
        {children}

        {/* Label */}
        <div className="text-center mt-1">
          <span className="text-xs font-bold text-white tracking-wide drop-shadow-md block truncate max-w-[120px] w-full">
            {data.label || data.equipment?.label}
          </span>

          {/* Sub-label (Rating/Voltage) */}
          {(data.parameters?.voltage || data.parameters?.kvaRating || data.parameters?.kwRating) && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-mono block">
                {data.parameters?.kvaRating ? `${data.parameters.kvaRating}kVA` :
                  data.parameters?.kwRating ? `${data.parameters.kwRating}kW` :
                    data.parameters?.voltage ? `${data.parameters.voltage}V` : ''}
              </span>
              {/* Instantaneous Load Display */}
              {instantaneousLoadMap && instantaneousLoadMap.has(id) && (
                <span className="text-[9px] text-neon-cyan font-mono block mt-0.5">
                  {(instantaneousLoadMap.get(id) / 1000).toFixed(1)}kW
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dual Power Source Indicator */}
      {data.equipment?.ports?.input === 2 && powerInfo?.sources?.length === 2 && (
        <DualPowerIndicator sources={powerInfo.sources} />
      )}

      {/* Power Source Indicator Box (top-right) */}
      {!isPowerGeneration && powerInfo?.isPowered && powerInfo?.sources?.length > 0 && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {powerInfo.sources.map((source, idx) => (
            <div
              key={idx}
              className="w-3 h-3 rounded-sm border border-black"
              style={{
                backgroundColor: source.color,
                boxShadow: `0 0 4px ${source.color}`,
              }}
              title={`Powered by: ${source.label}`}
            />
          ))}
        </div>
      )}

      {/* Fault Toggle Button */}
      {
        isHovered && (
          <button
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleNodeFault(id); }}
            className={`
            absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center
            border border-black transition-all duration-200 cursor-pointer z-50
            ${isFaulted ? 'bg-neon-red hover:bg-red-600' : 'bg-gray-600 hover:bg-neon-red'}
          `}
            title={isFaulted ? 'Clear fault' : 'Inject fault'}
          >
            <span className="text-white text-xs font-bold">!</span>
          </button>
        )
      }

      {/* Output Handles */}
      {
        data.equipment?.ports?.output > 0 &&
        Array.from({ length: data.equipment.ports.output }).map((_, i) => (
          <Handle
            key={`output-${i}`}
            type="source"
            position={Position.Bottom}
            id={`output-${i}`}
            className="w-5 h-5 border-2 border-gray-700 transition-colors hover:border-neon-green rounded-full"
            style={{
              left: `${((i + 1) / (data.equipment.ports.output + 1)) * 100}%`,
              transform: 'translateX(-50%)',
              background: '#00FF9F',
              boxShadow: '0 0 8px rgba(0, 255, 159, 0.6)',
            }}
          />
        ))
      }
    </div >
  );
}
