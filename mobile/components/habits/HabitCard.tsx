import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ThemedText } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, BorderRadius } from '../../constants/layout';
import type { Habit } from '../../../shared/src';

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  onComplete: () => void;
}

import { Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export function HabitCard({ habit, onPress, onComplete }: HabitCardProps) {
  const { colors } = useTheme();

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
      <Card style={styles.card} onPress={onPress}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.neon}20` }]}>
            <ThemedText variant="title" color="neon">
              {habit.icon || '📌'}
            </ThemedText>
          </View>

          <View style={styles.content}>
            <ThemedText variant="subtitle" numberOfLines={1}>
              {habit.title}
            </ThemedText>
            <ThemedText variant="caption" color="secondary" numberOfLines={1}>
              {habit.description || 'No description'}
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[
              styles.checkButton,
              {
                backgroundColor: habit.todayCompleted ? colors.neon : colors.bgTertiary,
                borderColor: habit.todayCompleted ? colors.neon : colors.border,
              },
            ]}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={habit.todayCompleted ? colors.bgPrimary : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </Card>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: Spacing.md,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
