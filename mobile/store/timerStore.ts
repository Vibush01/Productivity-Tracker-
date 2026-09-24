import { create } from 'zustand';
import { api } from '../services/api';
import type { TimerSession, TimerStats } from '../../shared/src';

interface TimerState {
  sessions: TimerSession[];
  stats: TimerStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  saveSession: (data: any) => Promise<{ xpGained: number; leveledUp: boolean; newLevel: number }>;
  fetchSessions: (filters?: Record<string, string>) => Promise<void>;
  fetchStats: (period?: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  sessions: [],
  stats: null,
  isLoading: false,
  error: null,
  pagination: null,

  saveSession: async (sessionData) => {
    const { data } = await api.post('/timer/sessions', sessionData);
    if (data.success) {
      set((state) => ({ sessions: [data.data.session, ...state.sessions] }));
      return {
        xpGained: data.data.xpGained,
        leveledUp: data.data.leveledUp,
        newLevel: data.data.newLevel,
      };
    }
    throw new Error('Failed to save session');
  },

  fetchSessions: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/timer/sessions${params ? `?${params}` : ''}`);
      if (data.success) {
        set({ sessions: data.data, pagination: data.pagination });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch sessions' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async (period = 'all') => {
    try {
      const { data } = await api.get(`/timer/stats?period=${period}`);
      if (data.success) set({ stats: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch timer stats' });
    }
  },

  deleteSession: async (id) => {
    const { data } = await api.delete(`/timer/sessions/${id}`);
    if (data.success) {
      set((state) => ({ sessions: state.sessions.filter((s) => s._id !== id) }));
    }
  },

  clearError: () => set({ error: null }),
}));
