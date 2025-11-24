import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // State
  selectedNodeId: null,
  selectedEdgeId: null,
  isPropertiesPanelOpen: true,
  isEquipmentPanelOpen: true,
  activeTab: 'equipment',
  clipboard: null,
  gridType: 'dots', // ReactFlow variants: 'dots', 'lines', 'cross'
  snapToGrid: false,
  showLoadProfileOverlays: true,

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

  toggleEquipmentPanel: () => set((state) => ({
    isEquipmentPanelOpen: !state.isEquipmentPanelOpen
  })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setGridType: (type) => set({ gridType: type }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleLoadProfileOverlays: () => set((state) => ({
    showLoadProfileOverlays: !state.showLoadProfileOverlays,
  })),

  // Clipboard actions
  copyToClipboard: (data) => set({ clipboard: data }),

  getClipboard: () => {
    const state = useUIStore.getState();
    return state.clipboard;
  },

  clearClipboard: () => set({ clipboard: null }),
}));
