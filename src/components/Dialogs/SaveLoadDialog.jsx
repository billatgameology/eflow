import { useState } from 'react';
import { getAllDiagrams, importDiagramFromFile } from '../../utils/persistence';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function SaveLoadDialog({ isOpen, onClose, mode }) {
  const { saveDiagram, loadDiagram, diagramName, setDiagramName } = useDiagramStore();
  const [diagrams, setDiagrams] = useState(getAllDiagrams());

  const handleSave = () => {
    saveDiagram();
    onClose();
  };

  const handleLoad = (diagram) => {
    loadDiagram(diagram);
    setDiagrams(getAllDiagrams());
    onClose();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const diagram = await importDiagramFromFile(file);
        loadDiagram(diagram);
        onClose();
      } catch (error) {
        alert('Failed to import diagram');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-neon-green mb-4">
          {mode === 'save' ? 'Save Diagram' : 'Load Diagram'}
        </h2>

        {mode === 'save' ? (
          <div>
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 text-white"
              placeholder="Diagram name"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary">Save</button>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="btn-secondary cursor-pointer inline-block">
                Import from file
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {diagrams.length > 0 ? (
                diagrams.map((diagram) => (
                  <div
                    key={diagram.id}
                    onClick={() => handleLoad(diagram)}
                    className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:border-neon-cyan"
                  >
                    <div className="font-semibold text-white">{diagram.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(diagram.metadata.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No saved diagrams found</p>
              )}
            </div>

            <button onClick={onClose} className="btn-secondary mt-4">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
