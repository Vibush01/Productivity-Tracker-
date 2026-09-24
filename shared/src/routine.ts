// ─── Routine ───────────────────────────────────
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

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
  timeOfDay: TimeOfDay;
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
  timeOfDay: TimeOfDay;
  startTime: string;
  items: { type: 'habit' | 'task'; refId: string; order: number; duration?: number }[];
  daysActive: number[];
}
