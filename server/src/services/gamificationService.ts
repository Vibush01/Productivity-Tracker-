import User from '../models/User.js';
import { Types } from 'mongoose';

// XP required per level (exponential curve)
const XP_CURVE = [
  0,    // Level 1: 0 XP
  100,  // Level 2: 100 XP
  250,  // Level 3: 250 XP
  500,  // Level 4: 500 XP
  850,  // Level 5: 850 XP
  1300, // Level 6: 1300 XP
  1900, // Level 7: 1900 XP
  2700, // Level 8: 2700 XP
  3800, // Level 9: 3800 XP
  5200, // Level 10: 5200 XP
];

export const XP_REWARDS = {
  HABIT_COMPLETE: 10,
  TASK_COMPLETE_LOW: 5,
  TASK_COMPLETE_MEDIUM: 10,
  TASK_COMPLETE_HIGH: 15,
  TASK_COMPLETE_URGENT: 20,
  ROUTINE_COMPLETE: 25,
  JOURNAL_ENTRY: 15,
  STREAK_7: 50,
  STREAK_14: 100,
  STREAK_30: 200,
  STREAK_100: 500,
  PERFECT_DAY: 30,
  HONESTY_CHECKIN: 25,
} as const;

/**
 * Calculate level from total XP
 */
export const calculateLevel = (xp: number): { level: number; currentXP: number; xpForNextLevel: number; progress: number } => {
  let level = 1;

  for (let i = 1; i < XP_CURVE.length; i++) {
    if (xp >= XP_CURVE[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  // For levels beyond the curve, use formula
  if (level >= XP_CURVE.length) {
    while (true) {
      const nextThreshold = Math.floor(XP_CURVE[XP_CURVE.length - 1] * Math.pow(1.4, level - XP_CURVE.length));
      if (xp >= nextThreshold) {
        level++;
      } else {
        break;
      }
    }
  }

  const currentLevelXP = level <= XP_CURVE.length ? XP_CURVE[level - 1] : Math.floor(XP_CURVE[XP_CURVE.length - 1] * Math.pow(1.4, level - 1 - XP_CURVE.length));
  const nextLevelXP = level < XP_CURVE.length ? XP_CURVE[level] : Math.floor(XP_CURVE[XP_CURVE.length - 1] * Math.pow(1.4, level - XP_CURVE.length));

  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = xpNeeded > 0 ? Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100) : 100;

  return {
    level,
    currentXP: xp,
    xpForNextLevel: nextLevelXP,
    progress,
  };
};

/**
 * Award XP to a user and handle level-ups
 */
export const awardXP = async (userId: string | Types.ObjectId, amount: number): Promise<{ newXP: number; leveledUp: boolean; newLevel: number }> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oldLevel = calculateLevel(user.xp).level;
  user.xp += amount;
  const { level: newLevel } = calculateLevel(user.xp);
  user.level = newLevel;

  await user.save();

  return {
    newXP: user.xp,
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
};

/**
 * Check and award streak milestone XP
 */
export const checkStreakMilestone = async (userId: string | Types.ObjectId, streakLength: number): Promise<number> => {
  let bonusXP = 0;

  if (streakLength === 7) bonusXP = XP_REWARDS.STREAK_7;
  else if (streakLength === 14) bonusXP = XP_REWARDS.STREAK_14;
  else if (streakLength === 30) bonusXP = XP_REWARDS.STREAK_30;
  else if (streakLength === 100) bonusXP = XP_REWARDS.STREAK_100;

  if (bonusXP > 0) {
    await awardXP(userId, bonusXP);
  }

  return bonusXP;
};
