/**
 * Create Task Modal
 * 
 * Form for creating a new task.
 * Fields: title, description, priority, due date, due time, category.
 */
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Button, Card, Input } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useTaskStore } from '../../store/taskStore';
import { useHabitStore } from '../../store/habitStore';
import { Spacing, BorderRadius } from '../../constants/layout';
import * as Haptics from 'expo-haptics';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#39FF14', emoji: '🟢' },
  { value: 'medium', label: 'Medium', color: '#FFB800', emoji: '🟡' },
  { value: 'high', label: 'High', color: '#FF8C00', emoji: '🟠' },
  { value: 'urgent', label: 'Urgent', color: '#FF3B3B', emoji: '🔴' },
];

export default function CreateTaskScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const createTask = useTaskStore((s) => s.createTask);
  const categories = useHabitStore((s) => s.categories);
  const fetchCategories = useHabitStore((s) => s.fetchCategories);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Default due date to today
    const today = new Date().toISOString().split('T')[0];
    setDueDate(today);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        category: categoryId || undefined,
        subtasks: [],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView variant="primary" style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.textSecondary} />
        </TouchableOpacity>
        <ThemedText variant="subtitle">New Task</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>TITLE *</ThemedText>
        <Input
          placeholder="e.g. Buy groceries"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>DESCRIPTION</ThemedText>
        <Input
          placeholder="Optional details"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Priority */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>PRIORITY</ThemedText>
        <View style={styles.priorityRow}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.priorityChip,
                {
                  backgroundColor: priority === opt.value ? `${opt.color}20` : colors.bgTertiary,
                  borderColor: priority === opt.value ? opt.color : 'transparent',
                },
              ]}
              onPress={() => setPriority(opt.value as any)}
            >
              <ThemedText style={{ fontSize: 16 }}>{opt.emoji}</ThemedText>
              <ThemedText
                variant="caption"
                style={{ color: priority === opt.value ? opt.color : colors.textSecondary, fontWeight: '600' }}
              >
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due Date */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>DUE DATE</ThemedText>
        <Input
          placeholder="YYYY-MM-DD"
          value={dueDate}
          onChangeText={setDueDate}
          keyboardType="numbers-and-punctuation"
        />

        {/* Due Time */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>DUE TIME (optional)</ThemedText>
        <Input
          placeholder="HH:MM (24h format)"
          value={dueTime}
          onChangeText={setDueTime}
          keyboardType="numbers-and-punctuation"
        />

        {/* Category */}
        {categories.length > 0 && (
          <>
            <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>CATEGORY</ThemedText>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: categoryId === cat._id ? `${cat.color}30` : colors.bgTertiary, borderColor: categoryId === cat._id ? cat.color : 'transparent' },
                  ]}
                  onPress={() => setCategoryId(categoryId === cat._id ? '' : cat._id)}
                >
                  <ThemedText style={{ fontSize: 14 }}>{cat.icon} {cat.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          fullWidth
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </Button>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: Spacing.xs },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing['5xl'],
  },
  fieldLabel: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  submitBtn: {
    marginTop: Spacing['3xl'],
  },
});
