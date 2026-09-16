// ─── User Types ─────────────────────────────────
export interface UserSettings {
  timezone: string;
  weekStartsOn: 0 | 1;
  dateFormat: string;
  reminderSound: boolean;
  anonymousOnLeaderboard: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  settings: UserSettings;
  xp: number;
  level: number;
  achievements: string[];
  createdAt: string;
}

// ─── Category ──────────────────────────────────
export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  isDefault: boolean;
  habitCount?: number;
}

// ─── Habit ─────────────────────────────────────
export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
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
  goalType: 'boolean' | 'count' | 'duration';
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

// ─── API Response ──────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Auth ──────────────────────────────────────
export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Motivation ────────────────────────────────
export interface Quote {
  text: string;
  author: string;
}

// ─── Toast ─────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// ─── Form Types ────────────────────────────────
export interface HabitFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  frequency: HabitFrequency;
  goalType: 'boolean' | 'count' | 'duration';
  goalValue: number;
  goalUnit: string;
  reminderTime: string;
}
