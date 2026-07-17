// src/store/simulationStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { FullSimulationResult } from '../types/simulation';

export interface SavedSimulationSummary {
  id: string;
  name: string;
  createdAt: string;
  startingAge: number;
  retirementAge: number;
  conservativeFinal: number;
  dualVehicleFinal: number;
}

interface SimulationState {
  current: FullSimulationResult | null;
  planName: string;
  currentId: string | null; // id of the saved row currently loaded, if any
  savedList: SavedSimulationSummary[];
  loadingList: boolean;

  setCurrent: (result: FullSimulationResult, planName: string) => void;
  clear: () => void;

  saveCurrent: () => Promise<{ error: string | null }>;
  loadSavedList: () => Promise<void>;
  loadById: (id: string) => Promise<{ error: string | null }>;
  deleteById: (id: string) => Promise<{ error: string | null }>;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  current: null,
  planName: 'My Plan',
  currentId: null,
  savedList: [],
  loadingList: false,

  setCurrent: (result, planName) => set({ current: result, planName, currentId: null }),
  clear: () => set({ current: null, planName: 'My Plan', currentId: null }),

  saveCurrent: async () => {
    const { current, planName, currentId } = get();
    const user = useAuthStore.getState().user;
    if (!current) return { error: 'No simulation to save.' };
    if (!user) return { error: 'You must be signed in to save.' };

    const { input } = current;
    const row = {
      user_id: user.id,
      name: planName,
      starting_age: input.startingAge,
      retirement_age: input.retirementAge,
      payments: input.payments,
      annual_rate_conservative: input.annualRateConservative,
      annual_rate_optimistic: input.annualRateOptimistic,
      annual_rate_fd_lock: input.annualRateFdLock,
      annual_rate_liquid: input.annualRateLiquid,
      inflation_rate: input.inflationRate,
      wht_rate: input.whtRate,
      mc_iterations: input.mcIterations,
      mc_mu: input.mcMu,
      mc_sigma: input.mcSigma,
      results: current,
    };

    if (currentId) {
      const { error } = await supabase.from('simulations').update(row).eq('id', currentId);
      if (error) return { error: error.message };
      return { error: null };
    }

    const { data, error } = await supabase
      .from('simulations')
      .insert(row)
      .select('id')
      .single();

    if (error) return { error: error.message };
    set({ currentId: data.id });
    return { error: null };
  },

  loadSavedList: async () => {
    set({ loadingList: true });
    const { data, error } = await supabase
      .from('simulations')
      .select('id, name, created_at, starting_age, retirement_age, results')
      .order('created_at', { ascending: false });

    if (error || !data) {
      set({ loadingList: false, savedList: [] });
      return;
    }

    const list: SavedSimulationSummary[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      startingAge: row.starting_age,
      retirementAge: row.retirement_age,
      conservativeFinal: row.results?.conservative?.finalNominal ?? 0,
      dualVehicleFinal: row.results?.dualVehicle?.finalNominal ?? 0,
    }));

    set({ savedList: list, loadingList: false });
  },

  loadById: async (id: string) => {
    const { data, error } = await supabase
      .from('simulations')
      .select('id, name, results')
      .eq('id', id)
      .single();

    if (error || !data) return { error: error?.message ?? 'Simulation not found.' };

    set({ current: data.results as FullSimulationResult, planName: data.name, currentId: data.id });
    return { error: null };
  },

  deleteById: async (id: string) => {
    const { error } = await supabase.from('simulations').delete().eq('id', id);
    if (error) return { error: error.message };
    set((state) => ({ savedList: state.savedList.filter((s) => s.id !== id) }));
    return { error: null };
  },
}));