/**
 * Create Habit Modal
 * 
 * Multi-field form for creating a new habit.
 * Fields: title, description, icon, color, category, frequency, goal type, reminder time.
 */
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView, ThemedText, Button, Card, Input } from '../../components/common';
import { useTheme } from '../../hooks/useTheme';
import { useHabitStore } from '../../store/habitStore';
import { Spacing, BorderRadius, FontSize } from '../../constants/layout';
import * as Haptics from 'expo-haptics';

const ICON_OPTIONS = ['💪', '📚', '🧘', '🏃', '💧', '🎯', '✍️', '🎸', '🍎', '💤', '🚶', '🧹', '💰', '🌱', '🔥', '⭐'];
const COLOR_OPTIONS = ['#39FF14', '#00D1FF', '#A855F7', '#FF3B3B', '#FFB800', '#FF8C00', '#EC4899', '#3B82F6', '#06B6D4', '#15803D', '#EAB308', '#6366F1'];
const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Custom', value: 'custom' },
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CreateHabitScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const createHabit = useHabitStore((s) => s.createHabit);
  const categories = useHabitStore((s) => s.categories);
  const fetchCategories = useHabitStore((s) => s.fetchCategories);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💪');
  const [color, setColor] = useState('#39FF14');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createHabit({
        title: title.trim(),
        description: description.trim(),
        icon,
        color,
        category: categoryId || undefined,
        frequency: {
          type: frequencyType,
          daysOfWeek: frequencyType === 'custom' ? selectedDays : undefined,
        },
        goalType: 'boolean',
        goalValue: 1,
        goalUnit: '',
        reminderTime: '',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create habit.');
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
        <ThemedText variant="subtitle">New Habit</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>TITLE *</ThemedText>
        <Input
          placeholder="e.g. Morning Run"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>DESCRIPTION</ThemedText>
        <Input
          placeholder="Optional description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Icon Picker */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>ICON</ThemedText>
        <View style={styles.pickerGrid}>
          {ICON_OPTIONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[
                styles.iconOption,
                { backgroundColor: icon === ic ? `${colors.neon}20` : colors.bgTertiary, borderColor: icon === ic ? colors.neon : 'transparent' },
              ]}
              onPress={() => setIcon(ic)}
            >
              <ThemedText style={{ fontSize: 24 }}>{ic}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Picker */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>COLOR</ThemedText>
        <View style={styles.pickerGrid}>
          {COLOR_OPTIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorOption,
                { backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' },
              ]}
              onPress={() => setColor(c)}
            >
              {color === c && <Ionicons name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        {categories.length > 0 && (
          <>
            <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>CATEGORY</ThemedText>
            <View style={styles.pickerGrid}>
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

        {/* Frequency */}
        <ThemedText variant="label" color="secondary" style={styles.fieldLabel}>FREQUENCY</ThemedText>
        <View style={styles.frequencyRow}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={frequencyType === opt.value ? 'primary' : 'secondary'}
              size="sm"
              style={{ flex: 1 }}
              onPress={() => setFrequencyType(opt.value as any)}
            >
              {opt.label}
            </Button>
          ))}
        </View>

        {/* Custom Days */}
        {frequencyType === 'custom' && (
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day, i) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  { backgroundColor: selectedDays.includes(i) ? colors.neon : colors.bgTertiary },
                ]}
                onPress={() => toggleDay(i)}
              >
                <ThemedText
                  variant="caption"
                  style={{ color: selectedDays.includes(i) ? '#000' : colors.textSecondary, fontWeight: '700' }}
                >
                  {day}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Submit */}
        <Button
          variant="primary"
          fullWidth
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
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
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  dayChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitBtn: {
    marginTop: Spacing['3xl'],
  },
});
