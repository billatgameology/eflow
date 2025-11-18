import { useDiagramStore } from '../../stores/useDiagramStore';
import { EQUIPMENT_CATEGORIES } from '../../data/equipmentDefinitions';

export default function NodeProperties({ node }) {
  const { updateNode } = useDiagramStore();

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
                  ${
                    node.data.equipment.color === color.value
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

        <div className="space-y-3">
          {Object.entries(node.data.parameters).map(([key, value]) => {
            const inputType = getInputType(value);

            // Skip isPowerSource from regular parameters (handled separately)
            if (key === 'isPowerSource') return null;

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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
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
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Input Ports</div>
            <div className="text-2xl font-bold text-neon-cyan">
              {node.data.equipment.ports.input}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Output Ports</div>
            <div className="text-2xl font-bold text-neon-green">
              {node.data.equipment.ports.output}
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
