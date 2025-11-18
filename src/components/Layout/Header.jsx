import { useState } from 'react';
import { useDiagramStore } from '../../stores/useDiagramStore';
import SaveLoadDialog from '../Dialogs/SaveLoadDialog';

export default function Header() {
  const { saveDiagram, exportDiagram, diagramName } = useDiagramStore();
  const [dialogMode, setDialogMode] = useState(null);

  const handleSave = () => {
    saveDiagram();
  };

  const handleExport = () => {
    exportDiagram();
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-neon-green neon-text">
              eFlow
            </h1>
            <span className="text-sm text-gray-400">{diagramName}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="btn-secondary"
            >
              Save
            </button>
            <button
              onClick={() => setDialogMode('load')}
              className="btn-secondary"
            >
              Load
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary"
            >
              Export
            </button>
            <label className="btn-secondary cursor-pointer">
              Import
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  // Will be handled in dialog component
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </header>

      <SaveLoadDialog
        isOpen={dialogMode !== null}
        onClose={() => setDialogMode(null)}
        mode={dialogMode}
      />
    </>
  );
}
