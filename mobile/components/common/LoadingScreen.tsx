/**
 * LoadingScreen — Full-screen centered spinner with theme background.
 *
 * Usage:
 *   if (loading) return <LoadingScreen />;
 *   <LoadingScreen message="Syncing your data..." />
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ThemedText } from './ThemedText';
import { Spacing } from '../../constants/layout';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <ActivityIndicator size="large" color={colors.neon} />
      {message && (
        <ThemedText variant="caption" color="secondary" style={styles.message}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.lg,
  },
});
