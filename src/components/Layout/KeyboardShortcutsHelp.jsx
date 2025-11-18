import { useState } from 'react';

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { category: 'General', items: [
      { keys: ['Esc'], description: 'Clear selection' },
      { keys: ['Ctrl/Cmd', 'S'], description: 'Save diagram' },
    ]},
    { category: 'Editing', items: [
      { keys: ['Delete/Backspace'], description: 'Delete selected node/edge' },
      { keys: ['Ctrl/Cmd', 'C'], description: 'Copy selected node' },
      { keys: ['Ctrl/Cmd', 'V'], description: 'Paste node' },
      { keys: ['Ctrl/Cmd', 'X'], description: 'Cut selected node' },
    ]},
    { category: 'History', items: [
      { keys: ['Ctrl/Cmd', 'Z'], description: 'Undo' },
      { keys: ['Ctrl/Cmd', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl/Cmd', 'Y'], description: 'Redo (alternative)' },
    ]},
  ];

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-gray-900 border-2 border-gray-700 rounded-full flex items-center justify-center text-neon-green hover:border-neon-green hover:shadow-neon-green transition-all z-40"
        title="Keyboard Shortcuts"
      >
        <span className="text-lg font-bold">?</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neon-green neon-text">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <h3 className="text-lg font-semibold text-neon-cyan mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-gray-800"
                      >
                        <span className="text-gray-300">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <kbd
                              key={keyIdx}
                              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs font-mono text-gray-200"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-500">
                <span className="text-neon-cyan">Tip:</span> You can also right-click on nodes and edges for context menu options.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
