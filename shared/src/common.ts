import type { User } from './user';

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

// ─── Stats ─────────────────────────────────────
export interface OverviewStats {
  totalHabits: number;
  totalTasks: number;
  completedTasks: number;
  totalCompletions: number;
  totalSessions: number;
  totalFocusSeconds: number;
  completionRate: number;
  bestStreak: number;
  xp: number;
  level: number;
}

export interface WeeklyDay {
  date: string;
  dayName: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
  rate: number;
}

export interface CategoryStat {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  completed: number;
}

// ─── Calendar ──────────────────────────────────
export interface CalendarDayData {
  habits: {
    habitId: string;
    title: string;
    icon: string;
    color: string;
    completed: boolean;
    value?: number;
    note?: string;
  }[];
  tasks: {
    _id: string;
    title: string;
    priority: string;
    completed: boolean;
  }[];
  completedHabits: number;
  totalHabits: number;
}

// ─── Program ───────────────────────────────────
export interface Program {
  _id: string;
  title: string;
  description: string;
  rules?: string;
  icon: string;
  color: string;
  habitToTrack: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  isActive: boolean;
  createdBy: { _id: string; name: string } | string;
  participantCount?: number;
  isJoined?: boolean;
  createdAt: string;
}

export interface ProgramParticipant {
  _id: string;
  programId: Program | string;
  userId: string;
  linkedHabitId?: string;
  joinedAt: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalDaysCompleted: number;
  lastLogDate?: string;
  participantCount?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  level: number;
  xp?: number;
  score: number;
  totalCompleted: number;
  bestStreak: number;
  currentStreak?: number;
  completionRate?: number;
  totalDaysCompleted?: number;
  isAnonymous: boolean;
}

// ─── Journal ───────────────────────────────────
export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface JournalEntry {
  _id: string;
  userId: string;
  date: string;
  title?: string;
  content: string;
  mood: MoodType;
  tags: string[];
  linkedHabits: { _id: string; title: string; icon: string; color: string }[];
  createdAt: string;
}

export interface MoodDistribution {
  _id: string;
  count: number;
}

export interface MoodTimeline {
  date: string;
  mood: string;
}

// ─── Toast (UI-agnostic) ──────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
