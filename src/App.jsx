import { useEffect, useRef } from 'react';
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

  // Use ref to access latest state inside interval without resetting it
  const diagramRef = useRef({ diagramId, diagramName, nodes, edges, metadata });

  useEffect(() => {
    diagramRef.current = { diagramId, diagramName, nodes, edges, metadata };
  }, [diagramId, diagramName, nodes, edges, metadata]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const { diagramId, diagramName, nodes, edges, metadata } = diagramRef.current;
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
  }, []); // Empty dependency array ensures interval is set only once

  return <MainLayout />;
}

export default App;
