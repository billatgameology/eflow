import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  selectedNodeId: null,
  selectedEdgeId: null,
  isPropertiesPanelOpen: true,
  activeTab: 'equipment',

  // Actions
  selectNode: (id) => set({
    selectedNodeId: id,
    selectedEdgeId: null,
    isPropertiesPanelOpen: true,
  }),

  selectEdge: (id) => set({
    selectedEdgeId: id,
    selectedNodeId: null,
    isPropertiesPanelOpen: true,
  }),

  clearSelection: () => set({
    selectedNodeId: null,
    selectedEdgeId: null
  }),

  togglePropertiesPanel: () => set((state) => ({
    isPropertiesPanelOpen: !state.isPropertiesPanelOpen
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
