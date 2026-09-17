// Achievement definitions — server-side constants (not DB)
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: string; // Human-readable
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ─── Common (Green) ───
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: '👣', rarity: 'common', condition: 'totalCompletions >= 1' },
  { id: 'getting_started', name: 'Getting Started', description: 'Create 3 habits', icon: '🌱', rarity: 'common', condition: 'totalHabits >= 3' },
  { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', icon: '✅', rarity: 'common', condition: 'totalTasksCompleted >= 10' },
  { id: 'streak_starter', name: 'Streak Starter', description: 'Achieve a 3-day streak', icon: '🔥', rarity: 'common', condition: 'bestStreak >= 3' },
  { id: 'journalist', name: 'Journalist', description: 'Write 5 journal entries', icon: '📝', rarity: 'common', condition: 'totalJournalEntries >= 5' },
  { id: 'timer_user', name: 'Time Keeper', description: 'Complete a timer session', icon: '⏱️', rarity: 'common', condition: 'totalTimerSessions >= 1' },
  { id: 'routine_runner', name: 'Routine Runner', description: 'Complete a routine', icon: '🔄', rarity: 'common', condition: 'totalRoutinesCompleted >= 1' },
  { id: 'social_joiner', name: 'Team Player', description: 'Join a program', icon: '🤝', rarity: 'common', condition: 'programsJoined >= 1' },

  // ─── Rare (Blue) ───
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', rarity: 'rare', condition: 'bestStreak >= 7' },
  { id: 'centurion', name: 'Centurion', description: '100 total completions', icon: '🏛️', rarity: 'rare', condition: 'totalCompletions >= 100' },
  { id: 'deep_focus', name: 'Deep Focus', description: 'Complete a 2+ hour focus session', icon: '🧠', rarity: 'rare', condition: 'longestFocusSession >= 7200' },
  { id: 'habit_builder', name: 'Habit Builder', description: 'Create 10 habits', icon: '🏗️', rarity: 'rare', condition: 'totalHabits >= 10' },
  { id: 'journal_keeper', name: 'Journal Keeper', description: '20 journal entries', icon: '📓', rarity: 'rare', condition: 'totalJournalEntries >= 20' },
  { id: 'task_champion', name: 'Task Champion', description: 'Complete 50 tasks', icon: '🏆', rarity: 'rare', condition: 'totalTasksCompleted >= 50' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Join 3 programs', icon: '🦋', rarity: 'rare', condition: 'programsJoined >= 3' },
  { id: 'xp_hunter', name: 'XP Hunter', description: 'Earn 500 XP', icon: '💫', rarity: 'rare', condition: 'totalXP >= 500' },

  // ─── Epic (Purple) ───
  { id: 'streak_master', name: 'Streak Master', description: '30-day streak', icon: '🌟', rarity: 'epic', condition: 'bestStreak >= 30' },
  { id: 'five_hundred', name: 'Five Hundred', description: '500 total completions', icon: '💎', rarity: 'epic', condition: 'totalCompletions >= 500' },
  { id: 'perfectionist', name: 'Perfectionist', description: '100% completion for a full week', icon: '✨', rarity: 'epic', condition: 'perfectWeeks >= 1' },
  { id: 'marathon_focus', name: 'Marathon Focus', description: '10 hours total focus time', icon: '🎯', rarity: 'epic', condition: 'totalFocusSeconds >= 36000' },
  { id: 'level_five', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', rarity: 'epic', condition: 'level >= 5' },
  { id: 'category_king', name: 'Category King', description: '100% in a category for a week', icon: '👑', rarity: 'epic', condition: 'categoryPerfectWeeks >= 1' },
  { id: 'xp_master', name: 'XP Master', description: 'Earn 2000 XP', icon: '🔮', rarity: 'epic', condition: 'totalXP >= 2000' },

  // ─── Legendary (Gold) ───
  { id: 'hundred_days', name: 'Centurion Streak', description: '100-day streak', icon: '🏅', rarity: 'legendary', condition: 'bestStreak >= 100' },
  { id: 'thousand', name: 'The Thousand', description: '1000 total completions', icon: '🌈', rarity: 'legendary', condition: 'totalCompletions >= 1000' },
  { id: 'level_ten', name: 'Legendary', description: 'Reach Level 10', icon: '👾', rarity: 'legendary', condition: 'level >= 10' },
  { id: 'unstoppable', name: 'Unstoppable', description: '365-day streak', icon: '🔱', rarity: 'legendary', condition: 'bestStreak >= 365' },
  { id: 'xp_legend', name: 'XP Legend', description: 'Earn 5000 XP', icon: '💠', rarity: 'legendary', condition: 'totalXP >= 5000' },
  { id: 'champion', name: 'Champion', description: 'Finish #1 in a program', icon: '🥇', rarity: 'legendary', condition: 'programWins >= 1' },
];

export default ACHIEVEMENTS;
