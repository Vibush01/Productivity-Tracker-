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

// ─── Task ──────────────────────────────────────
export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
}

export interface TaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category?: Category;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  dueTime?: string;
  isRecurring: boolean;
  recurrence?: TaskRecurrence;
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  order: number;
  createdAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  dueTime: string;
  subtasks: { title: string; completed: boolean }[];
}

// ─── Routine ───────────────────────────────────
export interface RoutineItem {
  _id?: string;
  type: 'habit' | 'task';
  refId: string;
  order: number;
  duration?: number;
  refData?: {
    _id: string;
    title: string;
    icon?: string;
    color?: string;
    priority?: string;
    completed?: boolean;
  };
}

export interface Routine {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime?: string;
  items: RoutineItem[];
  daysActive: number[];
  isActive: boolean;
  createdAt: string;
}

export interface RoutineFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime: string;
  items: { type: 'habit' | 'task'; refId: string; order: number; duration?: number }[];
  daysActive: number[];
}
