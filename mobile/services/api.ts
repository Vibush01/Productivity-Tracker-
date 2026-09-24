/**
 * API Client
 *
 * Axios instance pre-configured with:
 * - Base URL pointing to our shared Express backend
 * - JWT Bearer token auto-injection from SecureStore
 * - Response interceptor for 401 auto-logout
 *
 * Usage:
 *   import { api } from '@/services/api';
 *   const { data } = await api.get('/habits');
 */
import axios from 'axios';
import { config } from './config';
import { secureStorage } from './storage';

const api = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: attach JWT ──────────
api.interceptors.request.use(
  async (reqConfig) => {
    const token = await secureStorage.getToken();
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 and Offline ─────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored credentials
      await secureStorage.removeToken();
      // The auth store will handle navigation to login screen
      return Promise.reject(error);
    }

    // Network error handling (no response from server)
    if (!error.response) {
      const config = error.config;
      // If it's a mutating request, we can queue it for later
      const method = config?.method?.toLowerCase();
      if (['post', 'put', 'delete', 'patch'].includes(method)) {
        console.log(`[Offline] Enqueuing ${method.toUpperCase()} ${config.url}`);
        
        // Dynamically import enqueueAction to avoid circular dependencies
        const { enqueueAction } = await import('./sync');
        
        await enqueueAction({
          method: method as any,
          url: config.url,
          data: config.data ? JSON.parse(config.data) : undefined,
        });

        // Return a mock success response so the UI optimistically updates
        return Promise.resolve({
          data: { success: true, data: config.data ? JSON.parse(config.data) : null, _offline: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;
