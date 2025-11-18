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

  // Actions
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: node.id || uuidv4() }],
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } : node
    ),
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) =>
      edge.source !== id && edge.target !== id
    ),
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, { ...edge, id: edge.id || uuidv4() }],
  })),

  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

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
    });
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
