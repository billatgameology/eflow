export default function EquipmentItem({ equipment }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(equipment));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded cursor-move hover:border-neon-green hover:shadow-neon-green transition-all"
    >
      <span className="text-sm text-gray-200">{equipment.label}</span>
    </div>
  );
}
