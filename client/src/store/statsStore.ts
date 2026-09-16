import { create } from 'zustand';
import api from '../services/api';
import type { OverviewStats, WeeklyDay, HeatmapEntry, CategoryStat, CalendarDayData } from '../types';

interface StatsState {
  overview: OverviewStats | null;
  weekly: WeeklyDay[];
  monthly: { date: string; completed: number; total: number; rate: number }[];
  heatmap: HeatmapEntry[];
  categories: CategoryStat[];
  calendarData: Record<string, CalendarDayData>;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: (year: number, month: number) => Promise<void>;
  fetchHeatmap: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCalendarData: (year: number, month: number) => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  overview: null,
  weekly: [],
  monthly: [],
  heatmap: [],
  categories: [],
  calendarData: {},
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/stats/overview');
      if (data.success) set({ overview: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch overview' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWeekly: async () => {
    try {
      const { data } = await api.get('/stats/weekly');
      if (data.success) set({ weekly: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch weekly stats' });
    }
  },

  fetchMonthly: async (year, month) => {
    try {
      const { data } = await api.get(`/stats/monthly?year=${year}&month=${month}`);
      if (data.success) set({ monthly: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch monthly stats' });
    }
  },

  fetchHeatmap: async () => {
    try {
      const { data } = await api.get('/stats/heatmap');
      if (data.success) set({ heatmap: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch heatmap' });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/stats/categories');
      if (data.success) set({ categories: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch category stats' });
    }
  },

  fetchCalendarData: async (year, month) => {
    try {
      const { data } = await api.get(`/stats/calendar/${year}/${month}`);
      if (data.success) set({ calendarData: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch calendar data' });
    }
  },

  clearError: () => set({ error: null }),
}));
