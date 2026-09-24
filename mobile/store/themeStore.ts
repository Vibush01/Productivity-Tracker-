/**
 * Theme Store — Zustand store for theme management
 *
 * Supports: system, light, dark modes
 * Persists user preference in AsyncStorage
 * Provides computed `colors` and `isDark` values
 */
import { create } from 'zustand';
import { Appearance } from 'react-native';
import { Colors, type ThemeColors } from '../constants/colors';
import { storage } from '../services/storage';

const THEME_KEY = 'theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  /** User's preference: system, light, or dark */
  preference: ThemePreference;

  /** Whether the current effective theme is dark */
  isDark: boolean;

  /** Active color palette */
  colors: ThemeColors;

  /** Load saved preference from storage */
  initialize: () => Promise<void>;

  /** Update theme preference and persist */
  setPreference: (pref: ThemePreference) => Promise<void>;
}

function resolveTheme(pref: ThemePreference): { isDark: boolean; colors: ThemeColors } {
  let isDark: boolean;
  if (pref === 'system') {
    isDark = Appearance.getColorScheme() === 'dark';
  } else {
    isDark = pref === 'dark';
  }
  return { isDark, colors: isDark ? Colors.dark : Colors.light };
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  ...resolveTheme('system'),

  initialize: async () => {
    const saved = await storage.get<ThemePreference>(THEME_KEY);
    const pref = saved || 'system';
    set({ preference: pref, ...resolveTheme(pref) });
  },

  setPreference: async (pref) => {
    await storage.set(THEME_KEY, pref);
    set({ preference: pref, ...resolveTheme(pref) });
  },
}));
