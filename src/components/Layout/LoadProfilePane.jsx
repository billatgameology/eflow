import { useMemo } from 'react';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { useUIStore } from '../../stores/useUIStore';
import LoadProfileEditor from '../PropertiesPanel/LoadProfileEditor';
import { cloneLoadProfile } from '../../utils/loadProfile';

const getServerNodeFromSelection = (nodes, selectedNodeId) => {
  if (!nodes?.length) return null;

  if (selectedNodeId) {
    const directMatch = nodes.find((node) => node.id === selectedNodeId);
    if (directMatch?.type === 'server') {
      return directMatch;
    }
  }

  const selectedNodes = nodes.filter((node) => node.selected);
  return selectedNodes.find((node) => node.type === 'server') || null;
};

export default function LoadProfilePane() {
  const { nodes, updateNode } = useDiagramStore();
  const { selectedNodeId } = useUIStore();

  const selectedServerNode = useMemo(
    () => getServerNodeFromSelection(nodes, selectedNodeId),
    [nodes, selectedNodeId]
  );

  const loadProfile = useMemo(() => {
    if (!selectedServerNode) return null;
    return cloneLoadProfile(selectedServerNode.data.loadProfile);
  }, [selectedServerNode]);

  if (!selectedServerNode || !loadProfile) {
    return null;
  }

  const handlePointsChange = (points) => {
    updateNode(selectedServerNode.id, {
      data: {
        ...selectedServerNode.data,
        loadProfile: {
          enabled: true,
          points,
        },
      },
    });
  };

  const label =
    selectedServerNode.data.label || selectedServerNode.data.equipment?.label;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 pointer-events-none">
      <div className="pointer-events-auto bg-gray-950/95 backdrop-blur border-t border-gray-800 px-6 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.65)]">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Load Profile Editor
              </p>
              <h3 className="text-lg font-semibold text-white">
                {label}{' '}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({selectedServerNode.id})
                </span>
              </h3>
            </div>
            <div className="text-sm text-gray-400">
              Plot hourly utilization between 0–100% for the next 24 hours.
            </div>
          </div>

          <LoadProfileEditor
            key={selectedServerNode.id}
            points={loadProfile.points}
            onPointsChange={handlePointsChange}
          />
        </div>
      </div>
    </div>
  );
}
