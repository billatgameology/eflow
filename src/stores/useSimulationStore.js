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

  toggleNodeFault: (nodeId) => {
    console.log('toggleNodeFault called with:', nodeId);
    set((state) => {
      const newFaulted = new Set(state.faultedNodes);
      if (newFaulted.has(nodeId)) {
        console.log('Removing fault from node:', nodeId);
        newFaulted.delete(nodeId);
      } else {
        console.log('Adding fault to node:', nodeId);
        newFaulted.add(nodeId);
      }
      console.log('New faulted nodes:', Array.from(newFaulted));
      return { faultedNodes: newFaulted };
    });
  },

  toggleEdgeFault: (edgeId) => {
    console.log('toggleEdgeFault called with:', edgeId);
    set((state) => {
      const newFaulted = new Set(state.faultedEdges);
      if (newFaulted.has(edgeId)) {
        console.log('Removing fault from edge:', edgeId);
        newFaulted.delete(edgeId);
      } else {
        console.log('Adding fault to edge:', edgeId);
        newFaulted.add(edgeId);
      }
      console.log('New faulted edges:', Array.from(newFaulted));
      return { faultedEdges: newFaulted };
    });
  },

  setPowerFlowMap: (map) => set({ powerFlowMap: map }),

  addPowerSource: (source) => set((state) => ({
    powerSources: [...state.powerSources, source],
  })),

  removePowerSource: (sourceId) => set((state) => ({
    powerSources: state.powerSources.filter((s) => s.id !== sourceId),
  })),

  setPowerSources: (sources) => set({ powerSources: sources }),
}));
