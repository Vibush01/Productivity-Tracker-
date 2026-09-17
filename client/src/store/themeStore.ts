import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (resolved: 'light' | 'dark') => {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('pt-theme') as Theme) || 'dark',
  resolvedTheme: 'dark',

  setTheme: (theme) => {
    localStorage.setItem('pt-theme', theme);
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  initTheme: () => {
    const stored = (localStorage.getItem('pt-theme') as Theme) || 'dark';
    const resolved = stored === 'system' ? getSystemTheme() : stored;
    applyTheme(resolved);
    set({ theme: stored, resolvedTheme: resolved });

    // Listen for system theme changes
    if (stored === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const current = get().theme;
        if (current === 'system') {
          const newResolved = e.matches ? 'dark' : 'light';
          applyTheme(newResolved);
          set({ resolvedTheme: newResolved });
        }
      });
    }
  },
}));
