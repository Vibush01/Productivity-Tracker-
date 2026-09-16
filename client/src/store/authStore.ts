import { create } from 'zustand';
import api from '../services/api';
import type { User, AuthResponse } from '../types';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });

      if (data.success && data.data) {
        localStorage.setItem('token', data.data.token);
        connectSocket(data.data.user._id);
        set({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', { name, email, password });

      if (data.success && data.data) {
        localStorage.setItem('token', data.data.token);
        connectSocket(data.data.user._id);
        set({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    disconnectSocket();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const { data } = await api.get<{ success: boolean; data: User }>('/auth/me');

      if (data.success && data.data) {
        connectSocket(data.data._id);
        set({
          user: data.data,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      if (data.success && data.data) {
        set({ user: data.data });
      }
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Update failed' });
    }
  },

  clearError: () => set({ error: null }),
}));
