// src/store/simulationStore.ts
import { create } from 'zustand';
import type { FullSimulationResult } from '../types/simulation';

interface SimulationState {
  current: FullSimulationResult | null;
  planName: string;
  setCurrent: (result: FullSimulationResult, planName: string) => void;
  clear: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  current: null,
  planName: 'My Plan',
  setCurrent: (result, planName) => set({ current: result, planName }),
  clear: () => set({ current: null, planName: 'My Plan' }),
}));