import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '../constants/colors';

/**
 * useTheme — returns the correct color palette based on the device's
 * current color scheme (dark or light).
 *
 * Usage:
 *   const { colors, isDark } = useTheme();
 *   <View style={{ backgroundColor: colors.bgPrimary }} />
 */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? Colors.dark : Colors.light,
    isDark,
  };
}
