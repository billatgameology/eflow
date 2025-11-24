import { create } from 'zustand';

export const useSimulationStore = create((set, get) => ({
  // State
  isSimulating: false,
  simulationHour: 0,
  simulationIntervalId: null,
  powerSources: [],
  faultedNodes: new Set(),
  faultedEdges: new Set(),
  powerFlowMap: new Map(),
  instantaneousLoadMap: new Map(),

  // Actions
  startSimulation: () => {
    const { simulationIntervalId } = get();
    if (simulationIntervalId) return;

    const intervalId = setInterval(() => {
      set((state) => {
        const nextHour = state.simulationHour >= 23 ? 0 : state.simulationHour + 1;
        return { simulationHour: nextHour };
      });
    }, 1000);

    set({
      isSimulating: true,
      simulationHour: 0,
      simulationIntervalId: intervalId,
    });
  },

  pauseSimulation: () => {
    const { simulationIntervalId } = get();
    if (simulationIntervalId) {
      clearInterval(simulationIntervalId);
    }
    set({ isSimulating: false, simulationIntervalId: null });
  },

  setSimulationHour: (hour) => set({ simulationHour: Math.max(0, Math.min(23, hour)) }),

  toggleNodeFault: (nodeId) => {
    set((state) => {
      const newFaulted = new Set(state.faultedNodes);
      if (newFaulted.has(nodeId)) {
        newFaulted.delete(nodeId);
      } else {
        newFaulted.add(nodeId);
      }
      return { faultedNodes: newFaulted };
    });
  },

  toggleEdgeFault: (edgeId) => {
    set((state) => {
      const newFaulted = new Set(state.faultedEdges);
      if (newFaulted.has(edgeId)) {
        newFaulted.delete(edgeId);
      } else {
        newFaulted.add(edgeId);
      }
      return { faultedEdges: newFaulted };
    });
  },

  setPowerFlowMap: (map) => set({ powerFlowMap: map }),
  setInstantaneousLoadMap: (map) => set({ instantaneousLoadMap: map }),

  addPowerSource: (source) => set((state) => ({
    powerSources: [...state.powerSources, source],
  })),

  removePowerSource: (sourceId) => set((state) => ({
    powerSources: state.powerSources.filter((s) => s.id !== sourceId),
  })),

  setPowerSources: (sources) => set({ powerSources: sources }),
}));
