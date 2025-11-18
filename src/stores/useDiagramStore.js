import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { saveDiagramToLocalStorage, exportDiagramToFile } from '../utils/persistence';

export const useDiagramStore = create((set, get) => ({
  // State
  diagramId: uuidv4(),
  diagramName: 'Untitled Diagram',
  nodes: [],
  edges: [],
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // History for undo/redo
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Helper to save to history
  saveToHistory: () => {
    const state = get();
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(state.nodes)),
      edges: JSON.parse(JSON.stringify(state.edges)),
    };

    // Don't save duplicate snapshots
    if (state.history.length > 0 && state.historyIndex >= 0) {
      const lastSnapshot = state.history[state.historyIndex];
      if (JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) {
        return;
      }
    }

    // Remove any history after current index (for redo)
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    
    // Add new snapshot
    newHistory.push(snapshot);
    
    // Limit history size
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift();
      set({ history: newHistory });
    } else {
      set({ 
        history: newHistory,
        historyIndex: state.historyIndex + 1 
      });
    }
  },

  // Undo
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        historyIndex: newIndex,
      });
    }
  },

  // Redo
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      set({
        nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
        edges: JSON.parse(JSON.stringify(snapshot.edges)),
        historyIndex: newIndex,
      });
    }
  },

  // Actions
  addNode: (node) => {
    get().saveToHistory();
    set((state) => ({
      nodes: [...state.nodes, { ...node, id: node.id || uuidv4() }],
    }));
  },

  updateNode: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
    }));
  },

  removeNode: (id) => {
    get().saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) =>
        edge.source !== id && edge.target !== id
      ),
    }));
  },

  addEdge: (edge) => {
    get().saveToHistory();
    set((state) => ({
      edges: [...state.edges, { ...edge, id: edge.id || uuidv4() }],
    }));
  },

  removeEdge: (id) => {
    get().saveToHistory();
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  // Update nodes/edges without saving to history (for internal React Flow updates)
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  // Update nodes/edges with history (for user actions)
  setNodesWithHistory: (nodes) => {
    get().saveToHistory();
    set({ nodes });
  },
  
  setEdgesWithHistory: (edges) => {
    get().saveToHistory();
    set({ edges });
  },

  setDiagramName: (name) => set({ diagramName: name }),

  reset: () => set({
    diagramId: uuidv4(),
    diagramName: 'Untitled Diagram',
    nodes: [],
    edges: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }),

  // Persistence
  saveDiagram: () => {
    const state = get();
    const diagram = {
      id: state.diagramId,
      name: state.diagramName,
      nodes: state.nodes,
      edges: state.edges,
      metadata: {
        ...state.metadata,
        updatedAt: new Date().toISOString(),
      },
    };
    saveDiagramToLocalStorage(diagram);
  },

  loadDiagram: (diagram) => {
    set({
      diagramId: diagram.id,
      diagramName: diagram.name,
      nodes: diagram.nodes,
      edges: diagram.edges,
      metadata: diagram.metadata,
      history: [],
      historyIndex: -1,
    });
    // Save initial state to history
    setTimeout(() => get().saveToHistory(), 0);
  },

  exportDiagram: () => {
    const state = get();
    const diagram = {
      id: state.diagramId,
      name: state.diagramName,
      nodes: state.nodes,
      edges: state.edges,
      metadata: state.metadata,
    };
    exportDiagramToFile(diagram);
  },
}));
