import { useEffect, useMemo, useState } from 'react';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useSimulationStore } from '../../stores/useSimulationStore';
import { EQUIPMENT_CATEGORIES } from '../../data/equipmentDefinitions';
import LoadProfileEditor from './LoadProfileEditor';
import { createDefaultLoadProfile } from '../../utils/loadProfile';
import { loadProfileTemplates } from '../../utils/loadProfileTemplates';

export default function NodeProperties({ node }) {
  const { updateNode } = useDiagramStore();
  const { instantaneousLoadMap } = useSimulationStore();
  const [isLoadProfileCollapsed, setIsLoadProfileCollapsed] = useState(false);
  const isEndEquipment =
    node.data.equipment.category === EQUIPMENT_CATEGORIES.END_EQUIPMENT;

  const loadProfile = useMemo(
    () => node.data.loadProfile ?? createDefaultLoadProfile(),
    [node.data.loadProfile]
  );

  useEffect(() => {
    setIsLoadProfileCollapsed(false);
  }, [node.id]);

  const handleLabelChange = (e) => {
    updateNode(node.id, {
      data: { ...node.data, label: e.target.value },
    });
  };

  const handleParameterChange = (key, value) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        parameters: {
          ...node.data.parameters,
          [key]: value,
        },
      },
    });
  };

  const handleColorChange = (color) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        equipment: {
          ...node.data.equipment,
          color: color,
        },
      },
    });
  };

  const handleLoadProfilePointsChange = (points) => {
    updateNode(node.id, {
      data: {
        ...node.data,
        loadProfile: {
          ...loadProfile,
          points,
          enabled: true,
        },
      },
    });
  };

  const handleTemplateApply = (templateId) => {
    const template = loadProfileTemplates.find((entry) => entry.id === templateId);
    if (!template) return;

    const templatePoints = template.getPoints();
    updateNode(node.id, {
      data: {
        ...node.data,
        loadProfile: {
          enabled: true,
          points: templatePoints,
        },
      },
    });
  };

  // Predefined neon colors for power sources
  const neonColors = [
    { name: 'Cyan', value: '#00D9FF' },
    { name: 'Green', value: '#00FF9F' },
    { name: 'Magenta', value: '#FF00FF' },
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Red', value: '#FF0055' },
    { name: 'Orange', value: '#FF6B00' },
    { name: 'Purple', value: '#9D00FF' },
  ];

  // Helper to format parameter keys
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Determine input type based on parameter value
  const getInputType = (value) => {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'checkbox';
    return 'text';
  };

  return (
    <div className="space-y-4">
      {/* Equipment Type Badge */}
      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
        <span className="text-3xl">{node.data.equipment.icon}</span>
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {node.data.equipment.category}
          </div>
          <div className="text-sm font-semibold text-white">
            {node.data.equipment.label}
          </div>
        </div>
      </div>

      {/* Load Profile Section */}
      {isEndEquipment && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsLoadProfileCollapsed((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-200 uppercase tracking-wide"
            >
              <span className="text-lg leading-none">
                {isLoadProfileCollapsed ? '▸' : '▾'}
              </span>
              Load Profile
            </button>
            <span className="text-[10px] font-mono text-gray-500">
              Always enabled · 24h horizon
            </span>
          </div>

          {!isLoadProfileCollapsed && (
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                  Quick Templates
                </div>
                <div className="space-y-2">
                  {loadProfileTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateApply(template.id)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-700 bg-gray-900/70 hover:border-neon-cyan transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {template.name}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Apply
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <LoadProfileEditor
                points={loadProfile.points}
                onPointsChange={handleLoadProfilePointsChange}
              />
              <p className="text-xs text-gray-500">
                Click or drag on the chart to shape hourly utilization. Endpoints
                at 00:00 and 23:00 remain locked for continuity.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Label Input */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          Custom Label
        </label>
        <input
          type="text"
          value={node.data.label}
          onChange={handleLabelChange}
          placeholder={node.data.equipment.label}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-green focus:outline-none focus:ring-1 focus:ring-neon-green transition-all"
        />
      </div>

      {/* Color Assignment (only for power generation equipment) */}
      {node.data.equipment.category === EQUIPMENT_CATEGORIES.GENERATION && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            Power Source Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {neonColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`
                  h-10 rounded-lg border-2 transition-all
                  ${node.data.equipment.color === color.value
                    ? 'border-white scale-110'
                    : 'border-gray-700 hover:border-gray-500'
                  }
                `}
                style={{
                  backgroundColor: color.value,
                  boxShadow:
                    node.data.equipment.color === color.value
                      ? `0 0 12px ${color.value}`
                      : 'none',
                }}
                title={color.name}
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Selected: {neonColors.find((c) => c.value === node.data.equipment.color)?.name || 'Custom'}
          </div>
        </div>
      )}

      {/* Parameters Section */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Equipment Parameters
        </h3>

        {/* Real-time Load Display for Servers */}
        {node.type === 'server' && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 mb-3">
            <label className="block text-xs text-gray-500 mb-1">
              Real-time Load (Calculated)
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-mono text-neon-cyan font-bold">
                {instantaneousLoadMap?.has(node.id)
                  ? (instantaneousLoadMap.get(node.id) / 1000).toFixed(2)
                  : '0.00'}
              </span>
              <span className="text-xs text-gray-400">kW</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {node.data.parameters?.racksInRow || 1} racks × {node.data.parameters?.kwRating || 10}kW rating × utilization
            </div>
          </div>
        )}

        {/* Row Capacity Display for Servers */}
        {node.type === 'server' && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 mb-3">
            <label className="block text-xs text-gray-500 mb-2">
              Row Capacity (Max)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-mono text-neon-cyan font-bold">
                    {((node.data.parameters?.racksInRow || 1) * (node.data.parameters?.kwRating || 0)).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400">kW</span>
                </div>
                <div className="text-[10px] text-gray-500">Max Power</div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-mono text-neon-green font-bold">
                    {((node.data.parameters?.racksInRow || 1) * (node.data.parameters?.current || 0)).toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400">A</span>
                </div>
                <div className="text-[10px] text-gray-500">Max Current</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {Object.entries(node.data.parameters).map(([key, value]) => {
            const inputType = getInputType(value);

            // Skip isPowerSource from regular parameters (handled separately)
            if (key === 'isPowerSource') return null;
            // Skip powerDraw as it is now calculated
            if (key === 'powerDraw') return null;

            // Special handling for racksInRow
            if (key === 'racksInRow') {
              return (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1 capitalize">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={value}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) val = 1;
                        if (val < 1) val = 1;
                        if (val > 50) val = 50;
                        handleParameterChange(key, val);
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-12 text-sm text-white font-mono focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1 capitalize">
                  {formatLabel(key)}
                </label>

                {inputType === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleParameterChange(key, e.target.checked)}
                      className="w-4 h-4 bg-gray-800 border border-gray-700 rounded text-neon-green focus:ring-neon-green focus:ring-2"
                    />
                    <span className="text-sm text-gray-300">
                      {value ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                ) : inputType === 'number' ? (
                  <div className="relative">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        handleParameterChange(key, Number(e.target.value))
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-12 text-sm text-white font-mono focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${key.includes('kw') || key.includes('Kw') ? 'text-neon-cyan' :
                        key.includes('amp') || key.includes('Amp') ? 'text-neon-green' :
                          'text-gray-500'
                      }`}>
                      {key.includes('voltage') || key.includes('Voltage')
                        ? 'V'
                        : key.includes('amp') || key.includes('Amp')
                          ? 'A'
                          : key.includes('kw') || key.includes('Kw')
                            ? 'kW'
                            : key.includes('kva') || key.includes('Kva')
                              ? 'kVA'
                              : key.includes('phase')
                                ? 'Ø'
                                : key.includes('time') || key.includes('Time')
                                  ? 'ms'
                                  : key.includes('runtime') || key.includes('Runtime')
                                    ? 'min'
                                    : ''}
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleParameterChange(key, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Port Information */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Connection Ports
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Input Ports */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Input Ports</div>
            {node.data.equipment.category === EQUIPMENT_CATEGORIES.GENERATION ? (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="text-2xl font-bold text-gray-600">
                  {node.data.equipment.ports.input}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  N/A for generators
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const currentPorts = node.data.equipment.ports.input;
                    if (currentPorts > 0) {
                      updateNode(node.id, {
                        data: {
                          ...node.data,
                          equipment: {
                            ...node.data.equipment,
                            ports: {
                              ...node.data.equipment.ports,
                              input: currentPorts - 1,
                            },
                          },
                        },
                      });
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={node.data.equipment.ports.input === 0}
                  title="Decrease input ports"
                >
                  −
                </button>
                <div className="text-2xl font-bold text-neon-cyan">
                  {node.data.equipment.ports.input}
                </div>
                <button
                  onClick={() => {
                    const currentPorts = node.data.equipment.ports.input;
                    updateNode(node.id, {
                      data: {
                        ...node.data,
                        equipment: {
                          ...node.data.equipment,
                          ports: {
                            ...node.data.equipment.ports,
                            input: currentPorts + 1,
                          },
                        },
                      },
                    });
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-white font-bold transition-all"
                  title="Increase input ports"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Output Ports */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Output Ports</div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const currentPorts = node.data.equipment.ports.output;
                  if (currentPorts > 0) {
                    updateNode(node.id, {
                      data: {
                        ...node.data,
                        equipment: {
                          ...node.data.equipment,
                          ports: {
                            ...node.data.equipment.ports,
                            output: currentPorts - 1,
                          },
                        },
                      },
                    });
                  }
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={node.data.equipment.ports.output === 0}
                title="Decrease output ports"
              >
                −
              </button>
              <div className="text-2xl font-bold text-neon-green">
                {node.data.equipment.ports.output}
              </div>
              <button
                onClick={() => {
                  const currentPorts = node.data.equipment.ports.output;
                  updateNode(node.id, {
                    data: {
                      ...node.data,
                      equipment: {
                        ...node.data.equipment,
                        ports: {
                          ...node.data.equipment.ports,
                          output: currentPorts + 1,
                        },
                      },
                    },
                  });
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 text-white font-bold transition-all"
                title="Increase output ports"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Node Info Footer */}
      <div className="border-t border-gray-700 pt-4">
        <div className="text-xs text-gray-600 space-y-1">
          <div>Node ID: <span className="font-mono text-gray-500">{node.id}</span></div>
          <div>
            Position: <span className="font-mono text-gray-500">
              ({Math.round(node.position.x)}, {Math.round(node.position.y)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
