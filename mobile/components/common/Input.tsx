/**
 * Input — Themed text input with label, error state, and icon support.
 *
 * Usage:
 *   <Input label="Email" value={email} onChangeText={setEmail} />
 *   <Input label="Password" secureTextEntry error="Required" />
 *   <Input label="Search" icon={<Search />} />
 */
import React from 'react';
import { View, TextInput, Text, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.bgTertiary,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary },
            icon ? { paddingLeft: 0 } : undefined,
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    paddingVertical: Spacing.md,
  },
  error: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
