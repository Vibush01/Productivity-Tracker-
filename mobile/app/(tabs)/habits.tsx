/**
 * Habits Tab — Habit list and tracking
 */
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView, ThemedText } from '../../components/common';
import { Spacing } from '../../constants/layout';

export default function HabitsScreen() {
  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText variant="body" color="secondary">
          Your habits will appear here after logging in.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing['5xl'] },
});
