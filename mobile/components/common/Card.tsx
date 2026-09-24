/**
 * Card — Themed card container with optional border glow, press handling, and variants.
 *
 * Usage:
 *   <Card>Content here</Card>
 *   <Card variant="neon" onPress={...}>Highlighted card</Card>
 *   <Card variant="glass">Glass effect card</Card>
 */
import React from 'react';
import { TouchableOpacity, View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, BorderRadius } from '../../constants/layout';

type CardVariant = 'default' | 'neon' | 'glass';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  onPress?: () => void;
  padding?: number;
}

export function Card({
  variant = 'default',
  onPress,
  padding = Spacing.lg,
  style,
  children,
  ...props
}: CardProps) {
  const { colors } = useTheme();

  const cardStyle = [
    styles.base,
    { padding, backgroundColor: colors.bgSecondary, borderColor: colors.border },
    variant === 'neon' && { borderColor: colors.borderNeonStrong },
    variant === 'glass' && { backgroundColor: colors.glass },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
