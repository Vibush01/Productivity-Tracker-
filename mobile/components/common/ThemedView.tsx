/**
 * Themed View — A View component that auto-applies background color from theme.
 *
 * Usage:
 *   <ThemedView variant="primary">   → bgPrimary
 *   <ThemedView variant="secondary"> → bgSecondary
 *   <ThemedView variant="tertiary">  → bgTertiary
 */
import React from 'react';
import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeColors } from '../../constants/colors';

type BgVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

interface ThemedViewProps extends ViewProps {
  variant?: BgVariant;
}

const bgMap: Record<BgVariant, keyof ThemeColors> = {
  primary: 'bgPrimary',
  secondary: 'bgSecondary',
  tertiary: 'bgTertiary',
  quaternary: 'bgQuaternary',
};

export function ThemedView({ variant = 'primary', style, ...props }: ThemedViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[{ backgroundColor: colors[bgMap[variant]] }, style]}
      {...props}
    />
  );
}
