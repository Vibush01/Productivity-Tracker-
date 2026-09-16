import { create } from 'zustand';
import api from '../services/api';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (filters?: Record<string, string>) => Promise<void>;
  createTask: (data: any) => Promise<Task>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<{ xpGained: number; leveledUp: boolean; newLevel: number }>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; order: number }[]) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/tasks${params ? `?${params}` : ''}`);
      if (data.success) set({ tasks: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch tasks' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    if (data.success) {
      set((state) => ({ tasks: [...state.tasks, data.data] }));
      return data.data;
    }
    throw new Error('Failed to create task');
  },

  updateTask: async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    if (data.success) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...data.data } : t)),
      }));
    }
  },

  deleteTask: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    if (data.success) {
      set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
    }
  },

  completeTask: async (id) => {
    const { data } = await api.put(`/tasks/${id}/complete`);
    if (data.success) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...data.data.task } : t)),
      }));
      return {
        xpGained: data.data.xpGained,
        leveledUp: data.data.leveledUp,
        newLevel: data.data.newLevel,
      };
    }
    throw new Error('Failed to complete task');
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const { data } = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
    if (data.success) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? { ...t, ...data.data } : t)),
      }));
    }
  },

  reorderTasks: async (tasks) => {
    await api.put('/tasks/reorder', { tasks });
  },

  clearError: () => set({ error: null }),
}));
