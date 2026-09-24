import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ThemedText } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, BorderRadius } from '../../constants/layout';
import type { Task } from '../../../shared/src';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
}

import { Swipeable } from 'react-native-gesture-handler';

export function TaskCard({ task, onPress, onComplete }: TaskCardProps) {
  const { colors } = useTheme();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      case 'low':
      default:
        return colors.neon;
    }
  };

  const priorityColor = getPriorityColor();
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && !task.completed;

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: colors.neon }]}
        onPress={onComplete}
      >
        <Ionicons name="checkmark" size={24} color={colors.bgPrimary} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Card style={[styles.card, task.completed && { opacity: 0.6 }]} onPress={onPress}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: task.completed ? colors.neon : colors.bgTertiary,
                borderColor: task.completed ? colors.neon : priorityColor,
              },
            ]}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={16} color={colors.bgPrimary} />
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            <ThemedText
              variant="body"
              style={task.completed ? { textDecorationLine: 'line-through', color: colors.textSecondary } : {}}
              numberOfLines={1}
            >
              {task.title}
            </ThemedText>

            {task.dueDate && (
              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isOverdue ? colors.danger : colors.textTertiary}
                />
                <ThemedText
                  variant="caption"
                  color={isOverdue ? 'danger' : 'tertiary'}
                  style={styles.dateText}
                >
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    marginBottom: Spacing.sm,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
});
