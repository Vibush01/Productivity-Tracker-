/**
 * Habits Tab — Habit list and tracking
 */
import React, { useEffect, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedView, ThemedText, Card, Button } from '../../components/common';
import { HabitCard } from '../../components/habits/HabitCard';
import { useTheme } from '../../hooks/useTheme';
import { useHabitStore } from '../../store/habitStore';
import { Spacing } from '../../constants/layout';

export default function HabitsScreen() {
  const { colors } = useTheme();
  
  const habits = useHabitStore((s) => s.habits);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const logHabit = useHabitStore((s) => s.logHabit);
  const deleteLog = useHabitStore((s) => s.deleteLog);
  const isHabitsLoading = useHabitStore((s) => s.isLoading);

  const [refreshing, setRefreshing] = useState(false);

  const loadHabits = useCallback(async () => {
    await fetchHabits(false, new Date().toISOString().split('T')[0]);
  }, [fetchHabits]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHabits();
    setRefreshing(false);
  }, [loadHabits]);

  const activeHabits = habits.filter((h) => !h.isArchived);

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

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header Actions */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ThemedText variant="title">All Habits</ThemedText>
        <Button 
          variant="primary" 
          size="sm" 
          onPress={() => { /* Open modal to create habit */ }}
        >
          <Ionicons name="add" size={20} color={colors.bgPrimary} />
        </Button>
      </View>

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
        {activeHabits.length > 0 ? (
          activeHabits.map((habit) => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onPress={() => { /* Navigate to habit details */ }}
              onComplete={() => handleToggleHabit(habit._id, habit.todayCompleted)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={48} color={colors.textTertiary} />
            <ThemedText variant="subtitle" style={styles.emptyTitle}>
              No Habits Yet
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.emptyDesc}>
              Start tracking your daily routines by creating your first habit.
            </ThemedText>
            <Button variant="primary" onPress={() => {}} style={styles.emptyBtn}>
              Create Habit
            </Button>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  scroll: { 
    padding: Spacing.xl, 
    paddingBottom: Spacing['5xl'] 
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing['3xl'],
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyBtn: {
    minWidth: 150,
  }
});
