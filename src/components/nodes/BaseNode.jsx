import { Handle, Position } from 'reactflow';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { useUIStore } from '../../stores/useUIStore';
import { EQUIPMENT_CATEGORIES } from '../../data/equipmentDefinitions';
import DualPowerIndicator from './DualPowerIndicator';

export default function BaseNode({ id, data, selected }) {
  const { faultedNodes, toggleNodeFault, powerFlowMap } = useSimulationStore();
  const isFaulted = faultedNodes.has(id);
  const powerInfo = powerFlowMap.get(id);

  // Check if this is a power generation equipment
  const isPowerGeneration = data.equipment.category === EQUIPMENT_CATEGORIES.GENERATION;

  const handleContextMenu = (e) => {
    e.preventDefault();
    toggleNodeFault(id);
  };

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

  return (
    <div
      onContextMenu={handleContextMenu}
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

      {/* Fault Indicator */}
      {isFaulted && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
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
