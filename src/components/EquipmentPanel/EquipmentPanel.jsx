import { equipmentDefinitions, EQUIPMENT_CATEGORIES, getEquipmentByCategory } from '../../data/equipmentDefinitions';
import EquipmentItem from './EquipmentItem';

export default function EquipmentPanel() {
  const categories = [
    { id: EQUIPMENT_CATEGORIES.GENERATION, label: 'Power Generation' },
    { id: EQUIPMENT_CATEGORIES.DISTRIBUTION, label: 'Distribution' },
    { id: EQUIPMENT_CATEGORIES.PROTECTION, label: 'Protection' },
    { id: EQUIPMENT_CATEGORIES.END_EQUIPMENT, label: 'End Equipment' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold text-neon-green neon-text mb-4">
          Equipment Library
        </h2>

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
