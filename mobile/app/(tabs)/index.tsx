/**
 * Dashboard Tab — Home screen
 *
 * Shows: greeting, today's habits, streak summary, XP bar, motivational quote
 */
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView, ThemedText, Card } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing } from '../../constants/layout';

export default function DashboardScreen() {
  const { colors } = useTheme();

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="title" style={styles.greeting}>
          Good Morning 👋
        </ThemedText>
        <ThemedText variant="body" color="secondary">
          Let's make today count.
        </ThemedText>

        <Card style={styles.streakCard} variant="neon">
          <ThemedText variant="subtitle" color="neon">
            🔥 0 Day Streak
          </ThemedText>
          <ThemedText variant="caption" color="secondary" style={styles.streakSub}>
            Complete your habits to start a streak!
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Today's Habits
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Log in to see your habits here.
          </ThemedText>
        </Card>

        <Card style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Upcoming Tasks
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            No tasks due today.
          </ThemedText>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  streakCard: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  streakSub: {
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
});
