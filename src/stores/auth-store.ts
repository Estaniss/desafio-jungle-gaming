
import { create } from 'zustand';
import type { User } from '../types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clearSession: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
