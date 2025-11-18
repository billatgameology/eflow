import { useState, useEffect } from 'react';
import { getAllDiagrams, importDiagramFromFile, deleteDiagram } from '../../utils/persistence';
import { useDiagramStore } from '../../stores/useDiagramStore';

export default function SaveLoadDialog({ isOpen, onClose, mode }) {
  const { saveDiagram, loadDiagram, diagramName, setDiagramName } = useDiagramStore();
  const [diagrams, setDiagrams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && mode === 'load') {
      setDiagrams(getAllDiagrams());
    }
  }, [isOpen, mode]);

  const handleSave = () => {
    if (!diagramName.trim()) {
      setError('Please enter a diagram name');
      return;
    }
    saveDiagram();
    onClose();
  };

  const handleLoad = (diagram) => {
    loadDiagram(diagram);
    onClose();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this diagram?')) {
      deleteDiagram(id);
      setDiagrams(getAllDiagrams());
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const diagram = await importDiagramFromFile(file);
        loadDiagram(diagram);
        onClose();
      } catch (error) {
        setError(error.message || 'Failed to import diagram');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
          <span>{mode === 'save' ? '💾' : '📁'}</span>
          <span>{mode === 'save' ? 'Save Diagram' : 'Load Diagram'}</span>
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {mode === 'save' ? (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Diagram Name</label>
            <input
              type="text"
              value={diagramName}
              onChange={(e) => {
                setDiagramName(e.target.value);
                setError(null);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-4 text-gray-200 focus:border-neon-cyan focus:outline-none transition-colors"
              placeholder="Enter diagram name"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-neon-cyan text-black font-semibold rounded hover:bg-cyan-400 transition-colors"
              >
                💾 Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded cursor-pointer hover:border-neon-cyan transition-colors inline-flex items-center gap-2">
                <span>📥</span>
                <span>Import from file</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mb-2 text-sm text-gray-400">
              {diagrams.length === 0 ? 'No saved diagrams' : `${diagrams.length} saved diagram(s)`}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {diagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  onClick={() => handleLoad(diagram)}
                  className="p-3 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:border-neon-cyan transition-all group relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-200">{diagram.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(diagram.metadata?.updatedAt || diagram.metadata?.createdAt).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {diagram.nodes?.length || 0} nodes, {diagram.edges?.length || 0} connections
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, diagram.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                      title="Delete diagram"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-gray-200 border border-gray-700 rounded hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
