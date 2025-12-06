import { useState } from 'react';
import { useDiagramStore } from '../../stores/useDiagramStore';
import { importDiagramFromFile } from '../../utils/persistence';
import SaveLoadDialog from '../Dialogs/SaveLoadDialog';
import dcSampleData from '../../data/dcSample.json';

export default function Header() {
  const { exportDiagram, loadDiagram, reset, diagramName } = useDiagramStore();
  const [dialogMode, setDialogMode] = useState(null);

  const handleExport = () => {
    exportDiagram();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const diagram = await importDiagramFromFile(file);
        loadDiagram(diagram);
      } catch (error) {
        alert(error.message || 'Failed to import diagram');
      }
    }
    // Reset file input
    e.target.value = '';
  };

  const handleNew = () => {
    if (confirm('Create a new diagram? Any unsaved changes will be lost.')) {
      reset();
    }
  };

  const handleLoadDCSample = () => {
    if (confirm('Load DC Sample diagram? Any unsaved changes will be lost.')) {
      loadDiagram(dcSampleData);
    }
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

          <div className="flex gap-2">
            <button
              onClick={handleLoadDCSample}
              className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-magenta transition-colors text-sm font-medium flex items-center gap-1.5"
              title="Load DC Sample diagram"
            >
              <span>⚡</span>
              <span>DC Sample</span>
            </button>
            <div className="border-r border-gray-700"></div>
            <button
              onClick={handleNew}
              className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-yellow transition-colors text-sm font-medium flex items-center gap-1.5"
              title="Create new diagram (clears canvas)"
            >
              <span>📄</span>
              <span>New</span>
            </button>
            <div className="border-r border-gray-700"></div>
            <button
              onClick={() => setDialogMode('save')}
              className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan transition-colors text-sm font-medium flex items-center gap-1.5"
              title="Save diagram to browser storage"
            >
              <span>💾</span>
              <span>Save</span>
            </button>
            <button
              onClick={() => setDialogMode('load')}
              className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-cyan transition-colors text-sm font-medium flex items-center gap-1.5"
              title="Load diagram from browser storage"
            >
              <span>📁</span>
              <span>Load</span>
            </button>
            <div className="border-r border-gray-700"></div>
            <label className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-green transition-colors text-sm font-medium flex items-center gap-1.5 cursor-pointer"
              title="Import diagram from JSON file"
            >
              <span>📥</span>
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-neon-green transition-colors text-sm font-medium flex items-center gap-1.5"
              title="Export diagram to JSON file"
            >
              <span>📤</span>
              <span>Export</span>
            </button>
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
