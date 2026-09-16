import { create } from 'zustand';
import api from '../services/api';
import type { Routine } from '../types';

interface RoutineState {
  routines: Routine[];
  isLoading: boolean;
  error: string | null;
  fetchRoutines: (active?: boolean) => Promise<void>;
  getRoutine: (id: string) => Promise<Routine>;
  createRoutine: (data: any) => Promise<Routine>;
  updateRoutine: (id: string, data: any) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutine: (id: string) => Promise<void>;
  completeRoutine: (id: string) => Promise<{ xpGained: number; leveledUp: boolean; newLevel: number }>;
  clearError: () => void;
}

export const useRoutineStore = create<RoutineState>((set) => ({
  routines: [],
  isLoading: false,
  error: null,

  fetchRoutines: async (active) => {
    set({ isLoading: true, error: null });
    try {
      const params = active !== undefined ? `?active=${active}` : '';
      const { data } = await api.get(`/routines${params}`);
      if (data.success) set({ routines: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch routines' });
    } finally {
      set({ isLoading: false });
    }
  },

  getRoutine: async (id) => {
    const { data } = await api.get(`/routines/${id}`);
    if (data.success) return data.data;
    throw new Error('Failed to fetch routine');
  },

  createRoutine: async (routineData) => {
    const { data } = await api.post('/routines', routineData);
    if (data.success) {
      set((state) => ({ routines: [...state.routines, data.data] }));
      return data.data;
    }
    throw new Error('Failed to create routine');
  },

  updateRoutine: async (id, routineData) => {
    const { data } = await api.put(`/routines/${id}`, routineData);
    if (data.success) {
      set((state) => ({
        routines: state.routines.map((r) => (r._id === id ? { ...r, ...data.data } : r)),
      }));
    }
  },

  deleteRoutine: async (id) => {
    const { data } = await api.delete(`/routines/${id}`);
    if (data.success) {
      set((state) => ({ routines: state.routines.filter((r) => r._id !== id) }));
    }
  },

  toggleRoutine: async (id) => {
    const { data } = await api.put(`/routines/${id}/toggle`);
    if (data.success) {
      set((state) => ({
        routines: state.routines.map((r) =>
          r._id === id ? { ...r, isActive: data.data.isActive } : r
        ),
      }));
    }
  },

  completeRoutine: async (id) => {
    const { data } = await api.post(`/routines/${id}/complete`);
    if (data.success) {
      return {
        xpGained: data.data.xpGained,
        leveledUp: data.data.leveledUp,
        newLevel: data.data.newLevel,
      };
    }
    throw new Error('Failed to complete routine');
  },

  clearError: () => set({ error: null }),
}));
