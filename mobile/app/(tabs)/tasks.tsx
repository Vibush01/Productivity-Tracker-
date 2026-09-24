/**
 * Tasks Tab — Task list and tracking
 */
import React, { useEffect, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedView, ThemedText, Card, Button } from '../../components/common';
import { TaskCard } from '../../components/tasks/TaskCard';
import { useTheme } from '../../hooks/useTheme';
import { useTaskStore } from '../../store/taskStore';
import { Spacing } from '../../constants/layout';

export default function TasksScreen() {
  const { colors } = useTheme();
  
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const completeTask = useTaskStore((s) => s.completeTask);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const loadTasks = useCallback(async () => {
    // Fetch all for the tab to allow filtering locally
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleCompleteTask = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await completeTask(taskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header Actions */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <ThemedText variant="title">Tasks</ThemedText>
        <Button 
          variant="primary" 
          size="sm" 
          onPress={() => { /* Open modal to create task */ }}
        >
          <Ionicons name="add" size={20} color={colors.bgPrimary} />
        </Button>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['pending', 'completed', 'all'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setFilter(f)}
            style={styles.filterBtn}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
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
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onPress={() => { /* Navigate to task details */ }}
              onComplete={() => !task.completed && handleCompleteTask(task._id)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkbox-outline" size={48} color={colors.textTertiary} />
            <ThemedText variant="subtitle" style={styles.emptyTitle}>
              {filter === 'completed' ? 'No Completed Tasks' : 'All Caught Up!'}
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={styles.emptyDesc}>
              {filter === 'completed' 
                ? "You haven't completed any tasks yet." 
                : "You don't have any pending tasks right now."}
            </ThemedText>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterBtn: {
    flex: 1,
  },
  scroll: { 
    padding: Spacing.xl, 
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['5xl'] 
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing['3xl'],
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    textAlign: 'center',
  },
});
