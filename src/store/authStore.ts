// src/store/authStore.ts
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  currency: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile, isAdmin: profile?.is_admin ?? false }),
  setInitialized: (v) => set({ initialized: v }),
  clear: () => set({ session: null, user: null, profile: null, isAdmin: false }),
}));