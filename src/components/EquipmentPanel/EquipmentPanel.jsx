import { equipmentDefinitions, EQUIPMENT_CATEGORIES, getEquipmentByCategory } from '../../data/equipmentDefinitions';
import EquipmentItem from './EquipmentItem';
import { useUIStore } from '../../stores/useUIStore';

export default function EquipmentPanel() {
  const { isEquipmentPanelOpen, toggleEquipmentPanel } = useUIStore();

  const categories = [
    { id: EQUIPMENT_CATEGORIES.GENERATION, label: 'Power Generation' },
    { id: EQUIPMENT_CATEGORIES.DISTRIBUTION, label: 'Distribution' },
    { id: EQUIPMENT_CATEGORIES.PROTECTION, label: 'Protection' },
    { id: EQUIPMENT_CATEGORIES.END_EQUIPMENT, label: 'End Equipment' },
  ];

  if (!isEquipmentPanelOpen) {
    return (
      <button
        onClick={toggleEquipmentPanel}
        className="fixed left-0 top-1/2 bg-gray-900 border border-gray-700 p-2 rounded-r hover:bg-gray-800 transition-colors z-40"
        title="Show Equipment Library"
      >
        →
      </button>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-neon-green neon-text">
            Equipment Library
          </h2>
          <button
            onClick={toggleEquipmentPanel}
            className="text-gray-400 hover:text-white transition-colors"
            title="Hide Equipment Library"
          >
            ←
          </button>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              {category.label}
            </h3>
            <div className="space-y-2">
              {getEquipmentByCategory(category.id).map((equipment) => (
                <EquipmentItem key={equipment.type} equipment={equipment} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
