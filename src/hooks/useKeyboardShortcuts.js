import { useEffect } from 'react';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useUIStore } from '../stores/useUIStore';
import { useToastStore } from '../components/Layout/Toast';
import { v4 as uuidv4 } from 'uuid';

export function useKeyboardShortcuts() {
  const { 
    removeNode, 
    removeEdge,
    saveDiagram, 
    nodes, 
    edges,
    addNode,
    undo,
    redo,
  } = useDiagramStore();
  const { 
    selectedNodeId, 
    selectedEdgeId, 
    clearSelection,
    copyToClipboard,
    getClipboard,
  } = useUIStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete key - Remove selected node or edge
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault();
          removeNode(selectedNodeId);
          clearSelection();
          addToast('Node deleted', 'info');
        } else if (selectedEdgeId) {
          e.preventDefault();
          removeEdge(selectedEdgeId);
          clearSelection();
          addToast('Edge deleted', 'info');
        }
      }

      // Ctrl/Cmd + S - Save diagram
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDiagram();
        addToast('Diagram saved successfully', 'success');
      }

      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        addToast('Undo', 'info');
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
        addToast('Redo', 'info');
      }

      // Ctrl/Cmd + C - Copy selected node
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedNodeId) {
          e.preventDefault();
          const nodeToCopy = nodes.find(node => node.id === selectedNodeId);
          if (nodeToCopy) {
            copyToClipboard({
              type: 'node',
              data: JSON.parse(JSON.stringify(nodeToCopy))
            });
            addToast('Node copied to clipboard', 'success');
          }
        }
      }

      // Ctrl/Cmd + V - Paste node
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const clipboard = getClipboard();
        if (clipboard && clipboard.type === 'node') {
          const newNode = {
            ...clipboard.data,
            id: uuidv4(),
            position: {
              x: clipboard.data.position.x + 50,
              y: clipboard.data.position.y + 50,
            },
            data: {
              ...clipboard.data.data,
              label: `${clipboard.data.data.label} (Copy)`,
            },
          };
          addNode(newNode);
          addToast('Node pasted', 'success');
        }
      }

      // Ctrl/Cmd + X - Cut selected node (copy + delete)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (selectedNodeId) {
          e.preventDefault();
          const nodeToCopy = nodes.find(node => node.id === selectedNodeId);
          if (nodeToCopy) {
            copyToClipboard({
              type: 'node',
              data: JSON.parse(JSON.stringify(nodeToCopy))
            });
            removeNode(selectedNodeId);
            clearSelection();
            addToast('Node cut to clipboard', 'success');
          }
        }
      }

      // Escape - Clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedNodeId, 
    selectedEdgeId,
    nodes,
    edges,
    removeNode, 
    removeEdge,
    clearSelection, 
    saveDiagram,
    undo,
    redo,
    copyToClipboard,
    getClipboard,
    addNode,
    addToast,
  ]);
}
