import { useEffect, useRef } from 'react';
import MainLayout from './components/Layout/MainLayout';
import { useSimulation } from './hooks/useSimulation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDiagramStore } from './stores/useDiagramStore';
import { useSimulationStore } from './stores/useSimulationStore';
import { useUIStore } from './stores/useUIStore';
import { autoSave } from './utils/persistence';
import dcSampleData from './data/dcSample.json';

function App() {
  // Enable automatic power flow calculation
  useSimulation();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const { diagramId, diagramName, nodes, edges, metadata, loadDiagram, setNodes } = useDiagramStore();
  const { startSimulation, pauseSimulation } = useSimulationStore();
  const { selectNode } = useUIStore();

  // Use ref to access latest state inside interval without resetting it
  const diagramRef = useRef({ diagramId, diagramName, nodes, edges, metadata });

  useEffect(() => {
    diagramRef.current = { diagramId, diagramName, nodes, edges, metadata };
  }, [diagramId, diagramName, nodes, edges, metadata]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('videoDemo');

    if (demo === 'dc-sample') {
      const sample = JSON.parse(JSON.stringify(dcSampleData));
      loadDiagram(sample);

      const focusPduId = sample.nodes.find((node) => node.type === 'pdu')?.id;
      const timers = [];

      if (focusPduId) {
        timers.push(
          setTimeout(() => {
            setNodes(
              useDiagramStore.getState().nodes.map((node) => ({
                ...node,
                selected: node.id === focusPduId,
              }))
            );
            selectNode(focusPduId);
          }, 1600)
        );
      }

      timers.push(
        setTimeout(() => {
          pauseSimulation();
          startSimulation();
        }, 3400)
      );

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
        pauseSimulation();
      };
    }
  }, [loadDiagram]);

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
