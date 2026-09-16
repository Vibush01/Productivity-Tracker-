import { Request, Response } from 'express';
import HabitLog from '../models/HabitLog.js';
import Habit from '../models/Habit.js';
import Task from '../models/Task.js';
import TimerSession from '../models/TimerSession.js';
import { normalizeDate, getStartOfWeek, getMonthRange, getDateRange, toDateString } from '../utils/dateHelpers.js';

// @route   GET /api/stats/overview
// @desc    Get overall user stats
export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const [totalHabits, totalTasks, completedTasks, totalLogs, totalSessions] = await Promise.all([
      Habit.countDocuments({ userId, isArchived: false }),
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: true }),
      HabitLog.countDocuments({ userId, completed: true }),
      TimerSession.countDocuments({ userId }),
    ]);

    // Focus time
    const [focusAgg] = await TimerSession.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalFocus: { $sum: '$actualDuration' } } },
    ]);

    // Completion rate for last 30 days
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const recentLogs = await HabitLog.countDocuments({ userId, completed: true, date: { $gte: thirtyAgo } });
    const activeDays = 30; // simplified
    const completionRate = totalHabits > 0 ? Math.round((recentLogs / (totalHabits * activeDays)) * 100) : 0;

    // Best streak (from all habits)
    const habits = await Habit.find({ userId, isArchived: false }).select('_id');
    let bestStreak = 0;
    for (const habit of habits) {
      const logs = await HabitLog.find({ habitId: habit._id, completed: true })
        .sort({ date: 1 })
        .select('date');
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

    res.json({
      success: true,
      data: {
        totalHabits,
        totalTasks,
        completedTasks,
        totalCompletions: totalLogs,
        totalSessions,
        totalFocusSeconds: focusAgg?.totalFocus || 0,
        completionRate: Math.min(completionRate, 100),
        bestStreak,
        xp: req.user.xp,
        level: req.user.level,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching overview' });
  }
};

// @route   GET /api/stats/weekly
// @desc    Get day-by-day completion for the current week
export const getWeeklyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const weekStart = getStartOfWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    const habits = await Habit.find({ userId, isArchived: false });
    const totalHabits = habits.length;

    const logs = await HabitLog.find({
      userId,
      completed: true,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    const days = getDateRange(weekStart, weekEnd);
    const weeklyData = days.map((day) => {
      const dayStr = toDateString(day);
      const dayLogs = logs.filter((l) => toDateString(l.date) === dayStr);
      return {
        date: dayStr,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayLogs.length,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((dayLogs.length / totalHabits) * 100) : 0,
      };
    });

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching weekly stats' });
  }
};

// @route   GET /api/stats/monthly
// @desc    Get daily completion rates for a given month
export const getMonthlyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) ?? new Date().getMonth();
    const { start, end } = getMonthRange(year, month);

    const habits = await Habit.find({ userId, isArchived: false });
    const totalHabits = habits.length;

    const logs = await HabitLog.find({
      userId,
      completed: true,
      date: { $gte: start, $lte: end },
    });

    const days = getDateRange(start, end);
    const monthlyData = days.map((day) => {
      const dayStr = toDateString(day);
      const dayLogs = logs.filter((l) => toDateString(l.date) === dayStr);
      return {
        date: dayStr,
        completed: dayLogs.length,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((dayLogs.length / totalHabits) * 100) : 0,
      };
    });

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching monthly stats' });
  }
};

// @route   GET /api/stats/heatmap
// @desc    Get 365-day completion heatmap data
export const getHeatmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const habits = await Habit.find({ userId, isArchived: false });
    const totalHabits = habits.length;

    const logs = await HabitLog.aggregate([
      {
        $match: {
          userId,
          completed: true,
          date: { $gte: normalizeDate(start), $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const heatmapData = logs.map((entry) => ({
      date: entry._id,
      count: entry.count,
      rate: totalHabits > 0 ? Math.min(Math.round((entry.count / totalHabits) * 100), 100) : 0,
    }));

    res.json({ success: true, data: heatmapData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching heatmap' });
  }
};

// @route   GET /api/stats/categories
// @desc    Get completion breakdown by category
export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const habits = await Habit.find({ userId, isArchived: false }).populate('category', 'name icon color');

    const categoryMap: Record<string, { name: string; icon: string; color: string; total: number; completed: number }> = {};

    for (const habit of habits) {
      const cat = habit.category as any;
      const catId = cat?._id?.toString() || 'uncategorized';
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          name: cat?.name || 'Uncategorized',
          icon: cat?.icon || '📁',
          color: cat?.color || '#888888',
          total: 0,
          completed: 0,
        };
      }
      categoryMap[catId].total += 1;

      const completedLogs = await HabitLog.countDocuments({ habitId: habit._id, completed: true });
      categoryMap[catId].completed += completedLogs;
    }

    const categoryStats = Object.entries(categoryMap).map(([id, data]) => ({
      categoryId: id,
      ...data,
    }));

    res.json({ success: true, data: categoryStats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching category stats' });
  }
};

// @route   GET /api/stats/calendar/:year/:month
// @desc    Get calendar data for a given month (habits + tasks per day)
export const getCalendarData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.params.year as string);
    const month = parseInt(req.params.month as string); // 0-indexed
    const { start, end } = getMonthRange(year, month);

    const [habitLogs, tasks] = await Promise.all([
      HabitLog.find({ userId, date: { $gte: start, $lte: end } })
        .populate('habitId', 'title icon color'),
      Task.find({
        userId,
        $or: [
          { dueDate: { $gte: start, $lte: end } },
          { completedAt: { $gte: start, $lte: end } },
        ],
      }),
    ]);

    // Group by day
    const dayMap: Record<string, { habits: any[]; tasks: any[]; completedHabits: number; totalHabits: number }> = {};

    const allHabits = await Habit.find({ userId, isArchived: false });
    const totalHabits = allHabits.length;

    const days = getDateRange(start, end);
    for (const day of days) {
      const key = toDateString(day);
      const dayHabitLogs = habitLogs.filter((l) => toDateString(l.date) === key);
      const dayTasks = tasks.filter((t) => {
        if (t.dueDate && toDateString(t.dueDate) === key) return true;
        if (t.completedAt && toDateString(t.completedAt) === key) return true;
        return false;
      });

      dayMap[key] = {
        habits: dayHabitLogs.map((l) => ({
          habitId: (l.habitId as any)?._id,
          title: (l.habitId as any)?.title,
          icon: (l.habitId as any)?.icon,
          color: (l.habitId as any)?.color,
          completed: l.completed,
          value: l.value,
          note: l.note,
        })),
        tasks: dayTasks.map((t) => ({
          _id: t._id,
          title: t.title,
          priority: t.priority,
          completed: t.completed,
        })),
        completedHabits: dayHabitLogs.filter((l) => l.completed).length,
        totalHabits,
      };
    }

    res.json({ success: true, data: dayMap });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching calendar data' });
  }
};
