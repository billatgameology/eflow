import { create } from 'zustand';

export const useSimulationStore = create((set, get) => ({
  // State
  isSimulating: false,
  powerSources: [],
  faultedNodes: new Set(),
  faultedEdges: new Set(),
  powerFlowMap: new Map(),

  // Actions
  startSimulation: () => set({ isSimulating: true }),
  stopSimulation: () => set({ isSimulating: false }),

  toggleNodeFault: (nodeId) => set((state) => {
    const newFaulted = new Set(state.faultedNodes);
    if (newFaulted.has(nodeId)) {
      newFaulted.delete(nodeId);
    } else {
      newFaulted.add(nodeId);
    }
    return { faultedNodes: newFaulted };
  }),

  toggleEdgeFault: (edgeId) => set((state) => {
    const newFaulted = new Set(state.faultedEdges);
    if (newFaulted.has(edgeId)) {
      newFaulted.delete(edgeId);
    } else {
      newFaulted.add(edgeId);
    }
    return { faultedEdges: newFaulted };
  }),

  setPowerFlowMap: (map) => set({ powerFlowMap: map }),

  addPowerSource: (source) => set((state) => ({
    powerSources: [...state.powerSources, source],
  })),

  removePowerSource: (sourceId) => set((state) => ({
    powerSources: state.powerSources.filter((s) => s.id !== sourceId),
  })),

  setPowerSources: (sources) => set({ powerSources: sources }),
}));
