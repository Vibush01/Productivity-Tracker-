import { Document, Types } from 'mongoose';

// ─── User ───────────────────────────────────────────
export interface IUserSettings {
  timezone: string;
  weekStartsOn: 0 | 1;
  dateFormat: string;
  reminderSound: boolean;
  anonymousOnLeaderboard: boolean;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'user' | 'admin';
  settings: IUserSettings;
  xp: number;
  level: number;
  streakFreezes: number;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ─── Category ───────────────────────────────────────
export interface ICategory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  order: number;
  isDefault: boolean;
}

// ─── Habit ──────────────────────────────────────────
export interface IHabitFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  daysOfWeek?: number[];
  timesPerPeriod?: number;
  customInterval?: number;
}

export interface IHabit extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category?: Types.ObjectId;
  frequency: IHabitFrequency;
  goalType: 'boolean' | 'count' | 'duration';
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  isArchived: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── HabitLog ───────────────────────────────────────
export interface IHabitLog extends Document {
  _id: Types.ObjectId;
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  completed: boolean;
  value?: number;
  note?: string;
  createdAt: Date;
}

// ─── Task ───────────────────────────────────────────
export interface ITaskRecurrence {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
}

export interface ISubtask {
  title: string;
  completed: boolean;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category?: Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  dueTime?: string;
  isRecurring: boolean;
  recurrence?: ITaskRecurrence;
  subtasks: ISubtask[];
  completed: boolean;
  completedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Routine ────────────────────────────────────────
export interface IRoutineItem {
  type: 'habit' | 'task';
  refId: Types.ObjectId;
  order: number;
  duration?: number;
}

export interface IRoutine extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  icon: string;
  color: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  startTime?: string;
  items: IRoutineItem[];
  daysActive: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Program ────────────────────────────────────────
export interface IProgram extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  rules: string;
  icon: string;
  color: string;
  habitToTrack: string;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

// ─── Journal ────────────────────────────────────────
export interface IJournalEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  title?: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags: string[];
  linkedHabits: Types.ObjectId[];
  createdAt: Date;
}

// ─── Timer ──────────────────────────────────────────
export interface ITimerSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'pomodoro' | 'stopwatch' | 'countdown';
  linkedHabit?: Types.ObjectId;
  duration: number;
  actualDuration: number;
  startedAt: Date;
  endedAt?: Date;
  label?: string;
  createdAt: Date;
}

// ─── API Response Types ─────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Auth Types ─────────────────────────────────────
export interface AuthPayload {
  id: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<IUser, 'password'>;
}
