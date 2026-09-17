import { Request, Response } from 'express';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import Task from '../models/Task.js';
import TimerSession from '../models/TimerSession.js';
import JournalEntry from '../models/JournalEntry.js';
import ProgramParticipant from '../models/ProgramParticipant.js';
import { ACHIEVEMENTS } from '../utils/achievements.js';

// Helper to gather user stats for achievement evaluation
const getUserStats = async (userId: string) => {
  const [
    totalHabits,
    totalCompletions,
    totalTasksCompleted,
    totalTimerSessions,
    totalJournalEntries,
    programsJoined,
    user,
  ] = await Promise.all([
    Habit.countDocuments({ userId }),
    HabitLog.countDocuments({ userId, completed: true }),
    Task.countDocuments({ userId, isCompleted: true }),
    TimerSession.countDocuments({ userId }),
    JournalEntry.countDocuments({ userId }),
    ProgramParticipant.countDocuments({ userId }),
    User.findById(userId),
  ]);

  // Best streak
  const habits = await Habit.find({ userId });
  let bestStreak = 0;
  habits.forEach((h) => {
    if ((h as any).bestStreak > bestStreak) bestStreak = (h as any).bestStreak;
    if ((h as any).currentStreak > bestStreak) bestStreak = (h as any).currentStreak;
  });

  // Longest focus session
  const longestSession = await TimerSession.findOne({ userId }).sort({ duration: -1 }).lean();
  const longestFocusSession = longestSession?.duration || 0;

  // Total focus seconds
  const focusAgg = await TimerSession.aggregate([
    { $match: { userId: user?._id } },
    { $group: { _id: null, total: { $sum: '$duration' } } },
  ]);
  const totalFocusSeconds = focusAgg[0]?.total || 0;

  return {
    totalHabits,
    totalCompletions,
    totalTasksCompleted,
    totalTimerSessions,
    totalRoutinesCompleted: 0, // Simplified
    totalJournalEntries,
    programsJoined,
    bestStreak,
    longestFocusSession,
    totalFocusSeconds,
    totalXP: user?.xp || 0,
    level: user?.level || 1,
    perfectWeeks: 0,       // Complex calc — simplified for now
    categoryPerfectWeeks: 0,
    programWins: 0,
  };
};

// Evaluate conditions against stats
const evaluateCondition = (condition: string, stats: Record<string, number>): boolean => {
  const match = condition.match(/^(\w+)\s*(>=|>|==)\s*(\d+)$/);
  if (!match) return false;
  const [, key, op, valStr] = match;
  const val = parseInt(valStr);
  const stat = stats[key] || 0;
  if (op === '>=') return stat >= val;
  if (op === '>') return stat > val;
  if (op === '==') return stat === val;
  return false;
};

// @route   GET /api/achievements
export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    const userAchievements = user?.achievements || [];

    const achievements = ACHIEVEMENTS.map((def) => ({
      ...def,
      unlockedAt: userAchievements.includes(def.id) ? 'unlocked' : undefined,
    }));

    const unlocked = achievements.filter((a) => a.unlockedAt).length;
    res.json({ success: true, data: { achievements, unlocked, total: ACHIEVEMENTS.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching achievements' });
  }
};

// @route   POST /api/achievements/check
export const checkAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

    const stats = await getUserStats(req.user._id.toString());
    const currentAchievements = new Set(user.achievements || []);
    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENTS) {
      if (currentAchievements.has(def.id)) continue;
      if (evaluateCondition(def.condition, stats)) {
        newlyUnlocked.push(def.id);
        currentAchievements.add(def.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      user.achievements = Array.from(currentAchievements);
      await user.save();
    }

    const unlockedDefs = newlyUnlocked.map((id) => ACHIEVEMENTS.find((a) => a.id === id)!);
    res.json({ success: true, data: { newlyUnlocked: unlockedDefs, totalUnlocked: currentAchievements.size } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error checking achievements' });
  }
};
