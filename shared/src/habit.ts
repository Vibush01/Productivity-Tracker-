import type { Category } from './category';

// ─── Habit ─────────────────────────────────────
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type GoalType = 'boolean' | 'count' | 'duration';

export interface HabitFrequency {
  type: FrequencyType;
  daysOfWeek?: number[];
  timesPerPeriod?: number;
  customInterval?: number;
}

export interface Habit {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category?: Category;
  frequency: HabitFrequency;
  goalType: GoalType;
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  isArchived: boolean;
  order: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  todayValue: number;
  createdAt: string;
}

export interface HabitLog {
  _id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  value?: number;
  note?: string;
  createdAt: string;
}

export interface HabitLogResponse {
  log: HabitLog;
  currentStreak: number;
  longestStreak: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  accountabilityMessage: string | null;
  streakMessage: string | null;
}

export interface HabitFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  frequency: HabitFrequency;
  goalType: GoalType;
  goalValue: number;
  goalUnit: string;
  reminderTime: string;
}
