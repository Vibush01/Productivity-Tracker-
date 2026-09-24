import { Request, Response } from 'express';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import Task from '../models/Task.js';
import Routine from '../models/Routine.js';
import TimerSession from '../models/TimerSession.js';
import JournalEntry from '../models/JournalEntry.js';
import Program from '../models/Program.js';
import ProgramParticipant from '../models/ProgramParticipant.js';

// ─── Platform Stats ─────────────────────────────────
// @route   GET /api/admin/stats
export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newThisWeek,
      activeToday,
      totalHabits,
      totalTasks,
      totalPrograms,
      activePrograms,
      totalJournalEntries,
      totalTimerSessions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      HabitLog.distinct('userId', { date: { $gte: todayStart } }).then((ids) => ids.length),
      Habit.countDocuments(),
      Task.countDocuments(),
      Program.countDocuments(),
      Program.countDocuments({ isActive: true }),
      JournalEntry.countDocuments(),
      TimerSession.countDocuments(),
    ]);

    // Total XP across all users
    const xpAgg = await User.aggregate([{ $group: { _id: null, totalXP: { $sum: '$xp' } } }]);
    const totalXP = xpAgg[0]?.totalXP || 0;

    // Premium users count
    const premiumUsers = await User.countDocuments({ isPremium: true });

    // User signup trend (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const signupTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 5 users by XP
    const topUsers = await User.find()
      .sort({ xp: -1 })
      .limit(5)
      .select('name email xp level role createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        newThisWeek,
        activeToday,
        premiumUsers,
        totalHabits,
        totalTasks,
        totalPrograms,
        activePrograms,
        totalJournalEntries,
        totalTimerSessions,
        totalXP,
        signupTrend,
        topUsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching admin stats' });
  }
};

// ─── User Management ────────────────────────────────
// @route   GET /api/admin/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const role = req.query.role as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email role xp level isPremium isDisabled createdAt');

    // Get habit counts for each user
    const userIds = users.map((u) => u._id);
    const habitCounts = await Habit.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const habitMap = new Map(habitCounts.map((h) => [h._id.toString(), h.count]));

    const enrichedUsers = users.map((u) => ({
      ...u.toObject(),
      habitCount: habitMap.get(u._id.toString()) || 0,
    }));

    res.json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching users' });
  }
};

// @route   GET /api/admin/users/:id
export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

    const [habitCount, taskCount, routineCount, journalCount, timerCount, programCount] = await Promise.all([
      Habit.countDocuments({ userId: user._id }),
      Task.countDocuments({ userId: user._id }),
      Routine.countDocuments({ userId: user._id }),
      JournalEntry.countDocuments({ userId: user._id }),
      TimerSession.countDocuments({ userId: user._id }),
      ProgramParticipant.countDocuments({ userId: user._id }),
    ]);

    // Total completions
    const totalCompletions = await HabitLog.countDocuments({ userId: user._id, completed: true });

    res.json({
      success: true,
      data: {
        user,
        stats: { habitCount, taskCount, routineCount, journalCount, timerCount, programCount, totalCompletions },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching user detail' });
  }
};

// @route   PUT /api/admin/users/:id/role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role' });
      return;
    }

    // Don't allow demoting yourself
    if (req.params.id === req.user._id.toString() && role === 'user') {
      res.status(400).json({ success: false, error: 'Cannot demote yourself' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating role' });
  }
};

// @route   PUT /api/admin/users/:id/disable
export const toggleDisableUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }

    // Don't allow disabling yourself
    if (req.params.id === req.user._id.toString()) {
      res.status(400).json({ success: false, error: 'Cannot disable yourself' });
      return;
    }

    user.set('isDisabled', !(user as any).isDisabled);
    await user.save();

    res.json({ success: true, data: { isDisabled: (user as any).isDisabled } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error toggling user status' });
  }
};

// ─── Templates ──────────────────────────────────────
export const getTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const Template = (await import('../models/Template.js')).default;
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching templates' });
  }
};

export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const Template = (await import('../models/Template.js')).default;
    const template = await Template.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating template' });
  }
};

export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const Template = (await import('../models/Template.js')).default;
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating template' });
  }
};

export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const Template = (await import('../models/Template.js')).default;
    await Template.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting template' });
  }
};

// ─── Quotes ─────────────────────────────────────────
export const getQuotes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const Quote = (await import('../models/Quote.js')).default;
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching quotes' });
  }
};

export const createQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const Quote = (await import('../models/Quote.js')).default;
    const quote = await Quote.create(req.body);
    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating quote' });
  }
};

export const deleteQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const Quote = (await import('../models/Quote.js')).default;
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting quote' });
  }
};

// ─── Broadcast Notifications ────────────────────────
export const sendBroadcast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, body, segment } = req.body;
    // Note: segment could be 'all', 'free', 'premium'
    let query = {};
    if (segment === 'premium') query = { isPremium: true };
    if (segment === 'free') query = { isPremium: false };
    
    const users = await User.find({ ...query, pushTokens: { $exists: true, $not: { $size: 0 } } });
    
    const { sendPushNotification } = await import('../utils/pushNotifications.js');
    for (const user of users) {
      await sendPushNotification(user._id.toString(), { title, body });
    }

    res.json({ success: true, message: `Notification broadcasted to ${users.length} users.` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error sending broadcast' });
  }
};

// ─── Error Logs ─────────────────────────────────────
export const getSystemLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const SystemLog = (await import('../models/SystemLog.js')).default;
    const logs = await SystemLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching logs' });
  }
};
