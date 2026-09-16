import { Request, Response } from 'express';
import TimerSession from '../models/TimerSession.js';
import { awardXP, XP_REWARDS } from '../services/gamificationService.js';

// ─── XP Rewards for Timer ───────────────────────
const TIMER_XP: Record<string, number> = {
  pomodoro: 15,
  stopwatch: 5,
  countdown: 5,
};

// @route   POST /api/timer/sessions
// @desc    Save a completed timer session
export const saveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, linkedHabit, duration, actualDuration, startedAt, endedAt, label } = req.body;

    if (!type || !duration || !actualDuration || !startedAt) {
      res.status(400).json({ success: false, error: 'Missing required fields: type, duration, actualDuration, startedAt' });
      return;
    }

    const session = await TimerSession.create({
      userId: req.user._id,
      type,
      linkedHabit: linkedHabit || undefined,
      duration,
      actualDuration,
      startedAt,
      endedAt: endedAt || new Date(),
      label,
    });

    // Award XP
    const xp = TIMER_XP[type] || 5;
    const xpResult = await awardXP(req.user._id, xp);

    const populated = linkedHabit
      ? await session.populate('linkedHabit', 'title icon color')
      : session;

    res.status(201).json({
      success: true,
      data: {
        session: populated,
        xpGained: xp,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error saving session' });
  }
};

// @route   GET /api/timer/sessions
// @desc    Get session history with optional filters
export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate, limit = '20', page = '1' } = req.query;
    const filter: any = { userId: req.user._id };

    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.startedAt = {};
      if (startDate) filter.startedAt.$gte = new Date(startDate as string);
      if (endDate) filter.startedAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      TimerSession.find(filter)
        .populate('linkedHabit', 'title icon color')
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      TimerSession.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching sessions' });
  }
};

// @route   GET /api/timer/stats
// @desc    Get aggregated timer statistics
export const getTimerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period } = req.query; // 'week' | 'month' | 'all'
    const filter: any = { userId: req.user._id };

    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filter.startedAt = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filter.startedAt = { $gte: monthAgo };
    }

    const [stats] = await TimerSession.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalFocusTime: { $sum: '$actualDuration' },
          avgDuration: { $avg: '$actualDuration' },
          pomodoroCount: { $sum: { $cond: [{ $eq: ['$type', 'pomodoro'] }, 1, 0] } },
          stopwatchCount: { $sum: { $cond: [{ $eq: ['$type', 'stopwatch'] }, 1, 0] } },
          countdownCount: { $sum: { $cond: [{ $eq: ['$type', 'countdown'] }, 1, 0] } },
          longestSession: { $max: '$actualDuration' },
        },
      },
    ]);

    // Daily breakdown for the period
    const dailyStats = await TimerSession.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          sessions: { $sum: 1 },
          totalTime: { $sum: '$actualDuration' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats || {
          totalSessions: 0,
          totalFocusTime: 0,
          avgDuration: 0,
          pomodoroCount: 0,
          stopwatchCount: 0,
          countdownCount: 0,
          longestSession: 0,
        },
        dailyBreakdown: dailyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching timer stats' });
  }
};

// @route   DELETE /api/timer/sessions/:id
// @desc    Delete a timer session
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await TimerSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting session' });
  }
};
