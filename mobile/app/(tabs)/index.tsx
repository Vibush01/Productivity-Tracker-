/**
 * Dashboard Tab — Home screen
 *
 * Shows: personalized greeting, XP/level, streak card, today's habits, upcoming tasks
 */
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Card, Badge } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Spacing, BorderRadius } from '../../constants/layout';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getXpForLevel(level: number): number {
  return level * 100;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const greeting = getGreeting();
  const xpForNext = user ? getXpForLevel(user.level) : 100;
  const xpProgress = user ? (user.xp % 100) / xpForNext : 0;

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <ThemedText variant="title">
              {greeting} 👋
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              {user?.name || 'Guest'}
            </ThemedText>
          </View>
          {user && (
            <View style={styles.levelBadge}>
              <Badge type="level" value={user.level} />
            </View>
          )}
        </View>

        {/* XP Progress Bar */}
        {user && (
          <Card style={styles.xpCard}>
            <View style={styles.xpHeader}>
              <ThemedText variant="caption" color="neon">
                ⚡ {user.xp} XP
              </ThemedText>
              <ThemedText variant="caption" color="secondary">
                Level {user.level} → {user.level + 1}
              </ThemedText>
            </View>
            <View style={[styles.xpBarBg, { backgroundColor: colors.bgTertiary }]}>
              <View
                style={[
                  styles.xpBarFill,
                  {
                    backgroundColor: colors.neon,
                    width: `${Math.min(xpProgress * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </Card>
        )}

        {/* Streak Card */}
        <Card style={styles.streakCard} variant="neon">
          <View style={styles.streakRow}>
            <View>
              <ThemedText variant="subtitle" color="neon">
                🔥 0 Day Streak
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={styles.streakSub}>
                Complete your habits to start a streak!
              </ThemedText>
            </View>
            <View style={[styles.streakIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="flame" size={28} color={colors.warning} />
            </View>
          </View>
        </Card>

        {/* Today's Habits */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Today's Habits</ThemedText>
          <ThemedText variant="caption" color="neon">See All</ThemedText>
        </View>
        <Card style={styles.section}>
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.textTertiary} />
            <ThemedText variant="body" color="secondary" style={styles.emptyText}>
              Your habits will sync from the server.
            </ThemedText>
          </View>
        </Card>

        {/* Upcoming Tasks */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Upcoming Tasks</ThemedText>
          <ThemedText variant="caption" color="neon">See All</ThemedText>
        </View>
        <Card style={styles.section}>
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={40} color={colors.textTertiary} />
            <ThemedText variant="body" color="secondary" style={styles.emptyText}>
              No tasks due today. Enjoy your free time!
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: { flex: 1 },
  levelBadge: { marginLeft: Spacing.lg },
  xpCard: {
    marginTop: Spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  xpBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  streakCard: {
    marginTop: Spacing.lg,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakSub: { marginTop: Spacing.xs },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.sm,
  },
  section: {},
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
});
