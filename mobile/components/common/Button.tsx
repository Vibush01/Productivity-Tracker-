/**
 * Button — Reusable button component with theme-aware variants.
 *
 * Mirrors the web Button component's API for consistency.
 *
 * Usage:
 *   <Button variant="primary" onPress={handleLogin}>Log In</Button>
 *   <Button variant="secondary" loading>Saving...</Button>
 *   <Button variant="danger" size="sm" icon={<Trash />}>Delete</Button>
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles: Record<ButtonSize, { paddingH: number; paddingV: number; fontSize: number }> = {
    sm: { paddingH: Spacing.lg, paddingV: Spacing.sm, fontSize: FontSize.sm },
    md: { paddingH: Spacing.xl, paddingV: Spacing.md, fontSize: FontSize.md },
    lg: { paddingH: Spacing['3xl'], paddingV: Spacing.lg, fontSize: FontSize.lg },
  };

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.neon, text: '#000000' },
    secondary: { bg: 'transparent', text: colors.neon, border: colors.borderNeonStrong },
    danger: { bg: colors.danger, text: '#FFFFFF' },
    ghost: { bg: 'transparent', text: colors.textSecondary },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border || 'transparent',
          opacity: isDisabled ? 0.4 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: v.text, fontSize: s.fontSize },
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FontWeight.semibold,
  },
});
