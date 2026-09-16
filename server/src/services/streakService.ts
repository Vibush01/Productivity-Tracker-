import HabitLog from '../models/HabitLog.js';
import { Types } from 'mongoose';

/**
 * Normalize a date to midnight UTC for consistent day comparisons
 */
export const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Calculate current streak for a habit (consecutive days ending today or yesterday)
 */
export const calculateCurrentStreak = async (habitId: string | Types.ObjectId): Promise<number> => {
  const logs = await HabitLog.find({
    habitId,
    completed: true,
  })
    .sort({ date: -1 })
    .select('date')
    .lean();

  if (logs.length === 0) return 0;

  let streak = 0;
  const today = normalizeDate(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the most recent log is today or yesterday
  const lastLog = normalizeDate(new Date(logs[0].date));
  if (lastLog.getTime() !== today.getTime() && lastLog.getTime() !== yesterday.getTime()) {
    return 0;
  }

  // Count consecutive days
  let expectedDate = lastLog;
  for (const log of logs) {
    const logDate = normalizeDate(new Date(log.date));
    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate = new Date(expectedDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (logDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }

  return streak;
};

/**
 * Calculate longest ever streak for a habit
 */
export const calculateLongestStreak = async (habitId: string | Types.ObjectId): Promise<number> => {
  const logs = await HabitLog.find({
    habitId,
    completed: true,
  })
    .sort({ date: 1 })
    .select('date')
    .lean();

  if (logs.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < logs.length; i++) {
    const prevDate = normalizeDate(new Date(logs[i - 1].date));
    const currDate = normalizeDate(new Date(logs[i].date));
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    // diffDays === 0 means duplicate date, skip
  }

  return longestStreak;
};

/**
 * Calculate completion rate for a habit over a date range
 */
export const calculateCompletionRate = async (
  habitId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const completedCount = await HabitLog.countDocuments({
    habitId,
    date: { $gte: start, $lte: end },
    completed: true,
  });

  return totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
};

/**
 * Get streak data for all habits of a user
 */
export const getUserStreakData = async (userId: string | Types.ObjectId) => {
  const HabitModel = (await import('../models/Habit.js')).default;
  const habits = await HabitModel.find({ userId, isArchived: false }).lean();

  const streakData = await Promise.all(
    habits.map(async (habit) => ({
      habitId: habit._id,
      title: habit.title,
      currentStreak: await calculateCurrentStreak(habit._id),
      longestStreak: await calculateLongestStreak(habit._id),
    }))
  );

  return streakData;
};
