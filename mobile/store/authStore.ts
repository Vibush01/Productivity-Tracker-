/**
 * Auth Store — Zustand store for authentication state
 *
 * Manages: user data, JWT token, login/register/logout, auto-login on app start
 * Mirrors the web client's authStore for consistency.
 */
import { create } from 'zustand';
import { api } from '../services/api';
import { secureStorage, storage } from '../services/storage';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  xp: number;
  level: number;
  settings: Record<string, any>;
  achievements: string[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  /** Check for stored token and auto-login */
  initialize: () => Promise<void>;

  /** Login with email/password */
  login: (email: string, password: string) => Promise<void>;

  /** Register a new account */
  register: (name: string, email: string, password: string) => Promise<void>;

  /** Logout and clear stored credentials */
  logout: () => Promise<void>;

  /** Update user data in store */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await secureStorage.getToken();
      if (token) {
        // Validate token by fetching current user
        const { data } = await api.get('/auth/me');
        if (data.success) {
          set({
            user: data.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
    } catch {
      // Token invalid or expired
      await secureStorage.removeToken();
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      await secureStorage.setToken(data.data.token);
      await storage.set('user', data.data.user);
      set({
        user: data.data.user,
        token: data.data.token,
        isAuthenticated: true,
      });
    }
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.success) {
      await secureStorage.setToken(data.data.token);
      await storage.set('user', data.data.user);
      set({
        user: data.data.user,
        token: data.data.token,
        isAuthenticated: true,
      });
    }
  },

  logout: async () => {
    await secureStorage.removeToken();
    await storage.remove('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
