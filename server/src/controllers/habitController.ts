import { Request, Response } from 'express';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { calculateCurrentStreak, calculateLongestStreak, normalizeDate } from '../services/streakService.js';
import { awardXP, checkStreakMilestone, XP_REWARDS } from '../services/gamificationService.js';
import { getAccountabilityMessage, getSuspiciousStreakMessage } from '../services/motivationService.js';
import { getIO } from '../config/socket.js';

// @route   GET /api/habits
export const getHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { archived } = req.query;
    const filter: any = { userId: req.user._id };

    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = false;
    }

    const habits = await Habit.find(filter)
      .populate('category', 'name icon color')
      .sort({ order: 1, createdAt: -1 });

    const habitsWithStreaks = await Promise.all(
      habits.map(async (habit) => {
        const currentStreak = await calculateCurrentStreak(habit._id);
        const longestStreak = await calculateLongestStreak(habit._id);

        // Get log for the requested date (or today)
        const dateQuery = req.query.date ? new Date(req.query.date as string) : new Date();
        const targetDate = normalizeDate(dateQuery);
        
        const dateLog = await HabitLog.findOne({
          habitId: habit._id,
          date: targetDate,
        });

        return {
          ...habit.toObject(),
          currentStreak,
          longestStreak,
          todayCompleted: dateLog?.completed || false,
          todayValue: dateLog?.value || 0,
        };
      })
    );

    res.json({ success: true, data: habitsWithStreaks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching habits' });
  }
};

// @route   POST /api/habits
export const createHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const habitData = { ...req.body, userId: req.user._id };

    // Set order to last position
    const lastHabit = await Habit.findOne({ userId: req.user._id, isArchived: false }).sort({ order: -1 });
    habitData.order = lastHabit ? lastHabit.order + 1 : 0;

    const habit = await Habit.create(habitData);
    const populated = await habit.populate('category', 'name icon color');

    res.status(201).json({ success: true, data: { ...populated.toObject(), currentStreak: 0, longestStreak: 0, todayCompleted: false, todayValue: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating habit' });
  }
};

// @route   PUT /api/habits/:id
export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      res.status(404).json({ success: false, error: 'Habit not found' });
      return;
    }

    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name icon color');

    res.json({ success: true, data: updatedHabit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating habit' });
  }
};

// @route   DELETE /api/habits/:id
export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      res.status(404).json({ success: false, error: 'Habit not found' });
      return;
    }

    // Delete all logs for this habit
    await HabitLog.deleteMany({ habitId: habit._id });
    await habit.deleteOne();

    res.json({ success: true, message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting habit' });
  }
};

// @route   POST /api/habits/:id/log
export const logHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, completed = true, value, note } = req.body;
    const logDate = normalizeDate(date ? new Date(date) : new Date());

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      res.status(404).json({ success: false, error: 'Habit not found' });
      return;
    }

    // Upsert the log (create or update)
    const log = await HabitLog.findOneAndUpdate(
      { habitId: habit._id, date: logDate },
      {
        habitId: habit._id,
        userId: req.user._id,
        date: logDate,
        completed,
        value,
        note,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Calculate streak after logging
    const currentStreak = await calculateCurrentStreak(habit._id);
    const longestStreak = await calculateLongestStreak(habit._id);

    // Award XP for completion
    let xpGained = 0;
    let leveledUp = false;
    let newLevel = 0;

    if (completed) {
      const result = await awardXP(req.user._id, XP_REWARDS.HABIT_COMPLETE);
      xpGained = XP_REWARDS.HABIT_COMPLETE;
      leveledUp = result.leveledUp;
      newLevel = result.newLevel;

      // Check streak milestones
      const milestoneXP = await checkStreakMilestone(req.user._id, currentStreak);
      xpGained += milestoneXP;
    }

    // Get accountability/streak message
    const accountabilityMessage = completed ? getAccountabilityMessage() : null;
    const streakMessage = completed ? getSuspiciousStreakMessage(currentStreak) : null;

    // Emit real-time streak update
    try {
      const io = getIO();
      io.to(`user:${req.user._id}`).emit('streak:update', {
        habitId: habit._id,
        currentStreak,
        longestStreak,
        xpGained,
        leveledUp,
        newLevel,
      });
    } catch {
      // Socket not available, continue silently
    }

    res.json({
      success: true,
      data: {
        log,
        currentStreak,
        longestStreak,
        xpGained,
        leveledUp,
        newLevel,
        accountabilityMessage,
        streakMessage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error logging habit' });
  }
};

// @route   DELETE /api/habits/:id/log/:date
export const deleteLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const logDate = normalizeDate(new Date(req.params.date as string));

    const log = await HabitLog.findOneAndDelete({
      habitId: req.params.id,
      userId: req.user._id,
      date: logDate,
    });

    if (!log) {
      res.status(404).json({ success: false, error: 'Log not found' });
      return;
    }

    res.json({ success: true, message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting log' });
  }
};

// @route   GET /api/habits/:id/logs
export const getHabitLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { habitId: req.params.id, userId: req.user._id };

    if (startDate) filter.date = { ...filter.date, $gte: normalizeDate(new Date(startDate as string)) };
    if (endDate) filter.date = { ...filter.date, $lte: normalizeDate(new Date(endDate as string)) };

    const logs = await HabitLog.find(filter).sort({ date: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching logs' });
  }
};

// @route   PUT /api/habits/reorder
export const reorderHabits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { habits } = req.body; // Array of { id, order }

    if (!Array.isArray(habits)) {
      res.status(400).json({ success: false, error: 'Invalid habits array' });
      return;
    }

    await Promise.all(
      habits.map(({ id, order }: { id: string; order: number }) =>
        Habit.findOneAndUpdate({ _id: id, userId: req.user._id }, { order })
      )
    );

    res.json({ success: true, message: 'Habits reordered' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error reordering habits' });
  }
};

// @route   PUT /api/habits/:id/archive
export const archiveHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      res.status(404).json({ success: false, error: 'Habit not found' });
      return;
    }

    habit.isArchived = !habit.isArchived;
    await habit.save();

    res.json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error archiving habit' });
  }
};

// @route   GET /api/habits/templates
export const getTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { TEMPLATE_PACKS } = await import('../utils/habitTemplates.js');
    res.json({ success: true, data: TEMPLATE_PACKS });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching templates' });
  }
};

// @route   POST /api/habits/templates/:packId/import
export const importTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { TEMPLATE_PACKS } = await import('../utils/habitTemplates.js');
    const pack = TEMPLATE_PACKS.find((p) => p.id === req.params.packId);
    if (!pack) { res.status(404).json({ success: false, error: 'Template pack not found' }); return; }

    const existing = await Habit.countDocuments({ userId: req.user._id });

    const habitsToCreate = pack.habits.map((h, i) => ({
      userId: req.user._id,
      title: h.title,
      description: h.description,
      icon: h.icon,
      color: h.color,
      frequency: h.frequency,
      goalType: h.goalType,
      goalValue: h.goalValue,
      goalUnit: h.goalUnit,
      order: existing + i,
    }));

    const created = await Habit.insertMany(habitsToCreate);
    res.status(201).json({ success: true, data: { imported: created.length, habits: created } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error importing template' });
  }
};

// @route   GET /api/habits/:id/detail
export const getHabitDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) { res.status(404).json({ success: false, error: 'Habit not found' }); return; }

    // Get all logs for this habit
    const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id })
      .sort({ date: -1 })
      .limit(365)
      .lean();

    // Calculate stats
    const totalLogs = logs.length;
    const completedLogs = logs.filter((l) => l.completed);
    const totalCompleted = completedLogs.length;
    const completionRate = totalLogs > 0 ? Math.round((totalCompleted / totalLogs) * 100) : 0;

    // Current streak
    const currentStreak = await calculateCurrentStreak(habit._id);
    const longestStreak = await calculateLongestStreak(habit._id);

    // Completion by day of week
    const dayDistribution = [0, 0, 0, 0, 0, 0, 0];
    completedLogs.forEach((l) => {
      const day = new Date(l.date).getDay();
      dayDistribution[day]++;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = completedLogs.filter((l) => {
        const ld = new Date(l.date);
        return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
      }).length;
      monthlyTrend.push({ month: monthStr, count });
    }

    res.json({
      success: true,
      data: {
        habit,
        stats: { totalCompleted, completionRate, currentStreak, longestStreak },
        dayDistribution,
        monthlyTrend,
        recentLogs: logs.slice(0, 90), // Last 90 days of logs
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching habit detail' });
  }
};
