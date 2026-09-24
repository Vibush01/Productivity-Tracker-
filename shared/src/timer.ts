// ─── Timer ─────────────────────────────────────
export type TimerType = 'pomodoro' | 'stopwatch' | 'countdown';

export interface TimerSession {
  _id: string;
  userId: string;
  type: TimerType;
  linkedHabit?: {
    _id: string;
    title: string;
    icon: string;
    color: string;
  };
  duration: number;
  actualDuration: number;
  startedAt: string;
  endedAt?: string;
  label?: string;
  createdAt: string;
}

export interface TimerStats {
  overview: {
    totalSessions: number;
    totalFocusTime: number;
    avgDuration: number;
    pomodoroCount: number;
    stopwatchCount: number;
    countdownCount: number;
    longestSession: number;
  };
  dailyBreakdown: { _id: string; sessions: number; totalTime: number }[];
}
