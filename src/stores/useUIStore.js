import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  selectedNodeId: null,
  selectedEdgeId: null,
  isPropertiesPanelOpen: true,
  activeTab: 'equipment',
  clipboard: null,

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

  // Clipboard actions
  copyToClipboard: (data) => set({ clipboard: data }),

  getClipboard: () => {
    const state = useUIStore.getState();
    return state.clipboard;
  },

  clearClipboard: () => set({ clipboard: null }),
}));
