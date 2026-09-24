// ─── User Types ─────────────────────────────────
export interface UserSettings {
  timezone: string;
  weekStartsOn: 0 | 1;
  dateFormat: string;
  reminderSound: boolean;
  anonymousOnLeaderboard: boolean;
}

export type UserRole = 'user' | 'admin';

export type PremiumPlan = 'free' | 'monthly' | 'lifetime';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  settings: UserSettings;
  xp: number;
  level: number;
  streakFreezes: number;
  achievements: string[];
  pushTokens?: string[];
  isPremium: boolean;
  premiumPlan: PremiumPlan;
  premiumExpiresAt?: string;
  createdAt: string;
}
