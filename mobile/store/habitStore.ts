import { create } from 'zustand';
import { api } from '../services/api';
import type { Habit, HabitLogResponse, Category } from '../../shared/src';

interface HabitState {
  habits: Habit[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: (archived?: boolean, date?: string) => Promise<void>;
  createHabit: (data: any) => Promise<Habit>;
  updateHabit: (id: string, data: any) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (id: string, data?: any) => Promise<HabitLogResponse>;
  deleteLog: (habitId: string, date: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  reorderHabits: (habits: { id: string; order: number }[]) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<Category>;
  updateCategory: (id: string, data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchHabits: async (archived = false, date?: string) => {
    try {
      set({ isLoading: true, error: null });
      const queryParams = new URLSearchParams();
      queryParams.append('archived', archived.toString());
      if (date) queryParams.append('date', date);

      const { data } = await api.get(`/habits?${queryParams.toString()}`);
      if (data.success) {
        set({ habits: data.data, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch habits', isLoading: false });
    }
  },

  createHabit: async (habitData) => {
    try {
      const { data } = await api.post('/habits', habitData);
      if (data.success) {
        set((state) => ({ habits: [...state.habits, data.data] }));
        return data.data;
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create habit' });
      throw error;
    }
  },

  updateHabit: async (id, habitData) => {
    try {
      const { data } = await api.put(`/habits/${id}`, habitData);
      if (data.success) {
        set((state) => ({
          habits: state.habits.map((h) => (h._id === id ? { ...h, ...data.data } : h)),
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update habit' });
    }
  },

  deleteHabit: async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      set((state) => ({ habits: state.habits.filter((h) => h._id !== id) }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete habit' });
    }
  },

  logHabit: async (id, logData = {}) => {
    try {
      const { data } = await api.post(`/habits/${id}/log`, logData);
      if (data.success) {
        const result = data.data as HabitLogResponse;
        set((state) => ({
          habits: state.habits.map((h) =>
            h._id === id
              ? {
                  ...h,
                  currentStreak: result.currentStreak,
                  longestStreak: result.longestStreak,
                  todayCompleted: result.log.completed,
                  todayValue: result.log.value || 0,
                }
              : h
          ),
        }));
        return result;
      }
      throw new Error('Failed to log habit');
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to log habit' });
      throw error;
    }
  },

  deleteLog: async (habitId, date) => {
    try {
      await api.delete(`/habits/${habitId}/log/${date}`);
      set((state) => ({
        habits: state.habits.map((h) =>
          h._id === habitId ? { ...h, todayCompleted: false, todayValue: 0 } : h
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete log' });
    }
  },

  archiveHabit: async (id) => {
    try {
      await api.put(`/habits/${id}/archive`);
      set((state) => ({ habits: state.habits.filter((h) => h._id !== id) }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to archive habit' });
    }
  },

  reorderHabits: async (habitsOrder) => {
    try {
      await api.put('/habits/reorder', { habits: habitsOrder });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to reorder habits' });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) {
        set({ categories: data.data });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch categories' });
    }
  },

  createCategory: async (catData) => {
    try {
      const { data } = await api.post('/categories', catData);
      if (data.success) {
        set((state) => ({ categories: [...state.categories, data.data] }));
        return data.data;
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to create category' });
      throw error;
    }
  },

  updateCategory: async (id, catData) => {
    try {
      const { data } = await api.put(`/categories/${id}`, catData);
      if (data.success) {
        set((state) => ({
          categories: state.categories.map((c) => (c._id === id ? { ...c, ...data.data } : c)),
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update category' });
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      set((state) => ({ categories: state.categories.filter((c) => c._id !== id) }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to delete category' });
    }
  },

  clearError: () => set({ error: null }),
}));
