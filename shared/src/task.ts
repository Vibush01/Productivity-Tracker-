import type { Category } from './category';

// ─── Task ──────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

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
  priority: TaskPriority;
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
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
  subtasks: { title: string; completed: boolean }[];
}
