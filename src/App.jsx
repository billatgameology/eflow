import { useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import { useSimulation } from './hooks/useSimulation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDiagramStore } from './stores/useDiagramStore';
import { autoSave } from './utils/persistence';

function App() {
  // Enable automatic power flow calculation
  useSimulation();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const { diagramId, diagramName, nodes, edges, metadata } = useDiagramStore();

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const diagram = {
        id: diagramId,
        name: diagramName,
        nodes,
        edges,
        metadata,
      };
      autoSave(diagram);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [diagramId, diagramName, nodes, edges, metadata]);

  return <MainLayout />;
}

export default App;
