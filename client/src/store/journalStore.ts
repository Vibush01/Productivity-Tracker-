import { create } from 'zustand';
import api from '../services/api';
import type { JournalEntry, MoodDistribution, MoodTimeline } from '../types';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  moodStats: { distribution: MoodDistribution[]; timeline: MoodTimeline[] } | null;
  isLoading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; pages: number } | null;
  fetchEntries: (filters?: Record<string, string>) => Promise<void>;
  fetchEntry: (id: string) => Promise<void>;
  createEntry: (data: any) => Promise<{ xpGained: number; leveledUp: boolean; newLevel: number }>;
  updateEntry: (id: string, data: any) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  fetchMoodStats: (period?: number) => Promise<void>;
  clearError: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  currentEntry: null,
  moodStats: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchEntries: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/journal${params ? `?${params}` : ''}`);
      if (data.success) set({ entries: data.data, pagination: data.pagination });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch entries' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEntry: async (id) => {
    try {
      const { data } = await api.get(`/journal/${id}`);
      if (data.success) set({ currentEntry: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch entry' });
    }
  },

  createEntry: async (entryData) => {
    const { data } = await api.post('/journal', entryData);
    if (data.success) {
      set((state) => ({ entries: [data.data, ...state.entries] }));
      return { xpGained: data.xpGained, leveledUp: data.leveledUp, newLevel: data.newLevel };
    }
    throw new Error('Failed to create entry');
  },

  updateEntry: async (id, entryData) => {
    const { data } = await api.put(`/journal/${id}`, entryData);
    if (data.success) {
      set((state) => ({ entries: state.entries.map((e) => (e._id === id ? data.data : e)), currentEntry: data.data }));
    }
  },

  deleteEntry: async (id) => {
    const { data } = await api.delete(`/journal/${id}`);
    if (data.success) {
      set((state) => ({ entries: state.entries.filter((e) => e._id !== id) }));
    }
  },

  fetchMoodStats: async (period = 30) => {
    try {
      const { data } = await api.get(`/journal/mood-stats?period=${period}`);
      if (data.success) set({ moodStats: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch mood stats' });
    }
  },

  clearError: () => set({ error: null }),
}));
