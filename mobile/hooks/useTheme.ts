import { useThemeStore } from '../store/themeStore';
import type { ThemeColors } from '../constants/colors';

/**
 * useTheme — returns the active color palette from the theme store.
 *
 * Reads from the Zustand theme store which respects user preference
 * (system / light / dark) and persists across app restarts.
 *
 * Usage:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  return { colors, isDark };
}
