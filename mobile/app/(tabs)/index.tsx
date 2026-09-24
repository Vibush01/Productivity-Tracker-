/**
 * Dashboard Tab — Home screen
 *
 * Shows: personalized greeting, XP/level, streak card, today's habits, upcoming tasks
 */
import React, { useEffect, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView, ThemedText, Card, Badge } from '../../components/common';
import { HabitCard } from '../../components/habits/HabitCard';
import { TaskCard } from '../../components/tasks/TaskCard';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { useTaskStore } from '../../store/taskStore';
import { Spacing, BorderRadius } from '../../constants/layout';
import * as Haptics from 'expo-haptics';

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
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const user = useAuthStore((s) => s.user);
  
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const logHabit = useHabitStore((s) => s.logHabit);
  const deleteLog = useHabitStore((s) => s.deleteLog);
  const isHabitsLoading = useHabitStore((s) => s.isLoading);
  
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const completeTask = useTaskStore((s) => s.completeTask);
  const isTasksLoading = useTaskStore((s) => s.isLoading);

  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchHabits(false, new Date().toISOString().split('T')[0]),
      fetchTasks({ dueDate: new Date().toISOString().split('T')[0], completed: 'false' })
    ]);
  }, [fetchHabits, fetchTasks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const greeting = getGreeting();
  const xpForNext = user ? getXpForLevel(user.level) : 100;
  const xpProgress = user ? (user.xp % 100) / xpForNext : 0;

  const activeHabits = habits.filter(h => !h.isArchived);
  
  // Sort tasks by priority
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const upcomingTasks = [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);

  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (isCompleted) {
        await deleteLog(habitId, new Date().toISOString().split('T')[0]);
      } else {
        await logHabit(habitId, { value: 1, completed: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await completeTask(taskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Refetch to remove from upcoming list since we filter completed='false'
      fetchTasks({ dueDate: new Date().toISOString().split('T')[0], completed: 'false' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.neon}
            colors={[colors.neon]}
          />
        }
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
          <ThemedText 
            variant="caption" 
            color="neon" 
            style={styles.seeAll}
            onPress={() => router.push('/(tabs)/habits')}
          >
            See All
          </ThemedText>
        </View>
        
        {activeHabits.length > 0 ? (
          <View style={styles.listContainer}>
            {activeHabits.slice(0, 3).map(habit => (
              <HabitCard
                key={habit._id}
                habit={habit}
                onPress={() => {}}
                onComplete={() => handleToggleHabit(habit._id, habit.todayCompleted)}
              />
            ))}
          </View>
        ) : (
          <Card style={styles.section}>
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={40} color={colors.textTertiary} />
              <ThemedText variant="body" color="secondary" style={styles.emptyText}>
                No habits configured. Go to Habits tab to create one!
              </ThemedText>
            </View>
          </Card>
        )}

        {/* Upcoming Tasks */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="subtitle">Upcoming Tasks</ThemedText>
          <ThemedText 
            variant="caption" 
            color="neon" 
            style={styles.seeAll}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            See All
          </ThemedText>
        </View>

        {upcomingTasks.length > 0 ? (
          <View style={styles.listContainer}>
            {upcomingTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onPress={() => {}}
                onComplete={() => handleCompleteTask(task._id)}
              />
            ))}
          </View>
        ) : (
          <Card style={styles.section}>
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={40} color={colors.textTertiary} />
              <ThemedText variant="body" color="secondary" style={styles.emptyText}>
                No tasks due today. Enjoy your free time!
              </ThemedText>
            </View>
          </Card>
        )}
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
    marginBottom: Spacing.md,
  },
  seeAll: {
    padding: Spacing.xs,
  },
  listContainer: {
    gap: Spacing.sm,
  },
  section: {},
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
