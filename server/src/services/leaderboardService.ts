import User from '../models/User.js';
import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';
import { Types } from 'mongoose';
import { daysBetween } from '../utils/dateHelpers.js';

/**
 * Calculate consistency score for a user.
 * Formula: (totalDaysCompleted / totalDaysTracked) * streakBonus
 */
export const calculateConsistencyScore = async (userId: string | Types.ObjectId): Promise<{
  score: number;
  totalCompleted: number;
  totalTracked: number;
  bestStreak: number;
}> => {
  const habits = await Habit.find({ userId, isArchived: false });
  if (habits.length === 0) return { score: 0, totalCompleted: 0, totalTracked: 0, bestStreak: 0 };

  let totalCompleted = 0;
  let totalTracked = 0;
  let bestStreak = 0;

  for (const habit of habits) {
    const logs = await HabitLog.find({ habitId: habit._id, completed: true }).sort({ date: 1 });
    totalCompleted += logs.length;

    // Days since habit creation
    const daysActive = Math.max(daysBetween(habit.createdAt, new Date()), 1);
    totalTracked += daysActive;

    // Calculate streak
    let streak = 0;
    let maxStreak = 0;
    for (let i = 0; i < logs.length; i++) {
      if (i === 0) { streak = 1; }
      else {
        const diff = Math.round((logs[i].date.getTime() - logs[i - 1].date.getTime()) / 86400000);
        streak = diff === 1 ? streak + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, streak);
    }
    bestStreak = Math.max(bestStreak, maxStreak);
  }

  const baseRate = totalTracked > 0 ? totalCompleted / totalTracked : 0;
  // Streak bonus: 1.0 + (bestStreak * 0.01), capped at 1.5x
  const streakBonus = Math.min(1 + bestStreak * 0.01, 1.5);
  const score = Math.round(baseRate * streakBonus * 1000) / 10; // Score out of ~150

  return { score, totalCompleted, totalTracked, bestStreak };
};

/**
 * Get global rankings sorted by consistency score.
 */
export const getGlobalRankings = async (limit = 50): Promise<any[]> => {
  const users = await User.find({ role: 'user' }).select('name avatar settings xp level');
  const rankings: any[] = [];

  for (const user of users) {
    const { score, totalCompleted, bestStreak } = await calculateConsistencyScore(user._id);
    if (score > 0) {
      rankings.push({
        userId: user._id,
        name: user.settings?.anonymousOnLeaderboard ? 'Anonymous' : user.name,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        score,
        totalCompleted,
        bestStreak,
        isAnonymous: user.settings?.anonymousOnLeaderboard || false,
      });
    }
  }

  return rankings.sort((a, b) => b.score - a.score).slice(0, limit);
};

/**
 * Get weekly rankings (based on this week's completions).
 */
export const getWeeklyRankings = async (limit = 50): Promise<any[]> => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyLogs = await HabitLog.aggregate([
    { $match: { completed: true, date: { $gte: weekAgo } } },
    { $group: { _id: '$userId', completions: { $sum: 1 } } },
    { $sort: { completions: -1 } },
    { $limit: limit },
  ]);

  const rankings: any[] = [];
  for (const entry of weeklyLogs) {
    const user = await User.findById(entry._id).select('name avatar settings level xp');
    if (user) {
      rankings.push({
        userId: user._id,
        name: user.settings?.anonymousOnLeaderboard ? 'Anonymous' : user.name,
        avatar: user.avatar,
        level: user.level,
        score: entry.completions,
        totalCompleted: entry.completions,
        bestStreak: 0,
        isAnonymous: user.settings?.anonymousOnLeaderboard || false,
      });
    }
  }

  return rankings;
};
