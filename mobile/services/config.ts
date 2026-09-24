/**
 * API Configuration
 *
 * Central place for all environment-specific values.
 * In production, these should come from expo-constants or env vars.
 */

// For local development, use your machine's IP (not localhost)
// because the mobile emulator runs in its own network namespace.
// To find your IP: run `ipconfig getifaddr en0` in terminal.
const DEV_API_URL = 'http://localhost:5000/api';

export const config = {
  API_URL: DEV_API_URL,
  SOCKET_URL: DEV_API_URL.replace('/api', ''),
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_data',
} as const;
