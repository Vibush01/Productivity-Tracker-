/**
 * ThemedText — A Text component with built-in theme colors and typography presets.
 *
 * Usage:
 *   <ThemedText variant="title">Hello</ThemedText>
 *   <ThemedText variant="body" color="secondary">Subtitle</ThemedText>
 *   <ThemedText variant="caption" color="neon">Accent</ThemedText>
 */
import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, FontWeight } from '../../constants/layout';

type TextVariant = 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'label' | 'mono';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'neon' | 'danger' | 'warning' | 'info';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  bold?: boolean;
}

export function ThemedText({
  variant = 'body',
  color = 'primary',
  bold,
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const colorMap: Record<TextColor, string> = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    neon: colors.neon,
    danger: colors.danger,
    warning: colors.warning,
    info: colors.info,
  };

  const variantStyles: Record<TextVariant, object> = {
    hero: { fontSize: FontSize['5xl'], fontWeight: FontWeight.extrabold, letterSpacing: -1 },
    title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
    subtitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold },
    body: { fontSize: FontSize.lg, fontWeight: FontWeight.normal, lineHeight: 24 },
    caption: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
    label: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1, textTransform: 'uppercase' as const },
    mono: { fontSize: FontSize.md, fontFamily: 'SpaceMono' },
  };

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: colorMap[color] },
        bold && { fontWeight: FontWeight.bold },
        style,
      ]}
      {...props}
    />
  );
}
