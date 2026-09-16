import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category, { DEFAULT_CATEGORIES } from '../models/Category.js';
import { env } from '../config/env.js';

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE });
};

// @route   POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Please provide name, email and password' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password });

    // Seed default categories for the new user
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      userId: user._id,
      isDefault: true,
    }));
    await Category.insertMany(categories);

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          settings: user.settings,
          xp: user.xp,
          level: user.level,
          achievements: user.achievements,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          settings: user.settings,
          xp: user.xp,
          level: user.level,
          achievements: user.achievements,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        settings: user.settings,
        xp: user.xp,
        level: user.level,
        achievements: user.achievements,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @route   PUT /api/auth/profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, avatar, settings } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (settings) updateData.settings = { ...req.user.settings.toObject(), ...settings };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating profile' });
  }
};

// @route   PUT /api/auth/password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Please provide current and new password' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error changing password' });
  }
};

// @route   DELETE /api/auth/account
// @desc    Delete user account and all associated data
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ success: false, error: 'Password required to confirm deletion' });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Incorrect password' });
      return;
    }

    // Delete all user data
    const Habit = (await import('../models/Habit.js')).default;
    const HabitLog = (await import('../models/HabitLog.js')).default;
    const Task = (await import('../models/Task.js')).default;
    const Routine = (await import('../models/Routine.js')).default;
    const TimerSession = (await import('../models/TimerSession.js')).default;
    const JournalEntry = (await import('../models/JournalEntry.js')).default;
    const ProgramParticipant = (await import('../models/ProgramParticipant.js')).default;
    const CategoryModel = (await import('../models/Category.js')).default;

    await Promise.all([
      Habit.deleteMany({ userId: req.user._id }),
      HabitLog.deleteMany({ userId: req.user._id }),
      Task.deleteMany({ userId: req.user._id }),
      Routine.deleteMany({ userId: req.user._id }),
      TimerSession.deleteMany({ userId: req.user._id }),
      JournalEntry.deleteMany({ userId: req.user._id }),
      ProgramParticipant.deleteMany({ userId: req.user._id }),
      CategoryModel.deleteMany({ userId: req.user._id }),
    ]);

    await user.deleteOne();
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting account' });
  }
};

// @route   GET /api/auth/export
// @desc    Export all user data as JSON
export const exportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const Habit = (await import('../models/Habit.js')).default;
    const HabitLog = (await import('../models/HabitLog.js')).default;
    const Task = (await import('../models/Task.js')).default;
    const Routine = (await import('../models/Routine.js')).default;
    const TimerSession = (await import('../models/TimerSession.js')).default;
    const JournalEntry = (await import('../models/JournalEntry.js')).default;

    const [habits, habitLogs, tasks, routines, timerSessions, journalEntries] = await Promise.all([
      Habit.find({ userId: req.user._id }),
      HabitLog.find({ userId: req.user._id }),
      Task.find({ userId: req.user._id }),
      Routine.find({ userId: req.user._id }),
      TimerSession.find({ userId: req.user._id }),
      JournalEntry.find({ userId: req.user._id }),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: { name: req.user.name, email: req.user.email, xp: req.user.xp, level: req.user.level },
      habits, habitLogs, tasks, routines, timerSessions, journalEntries,
    };

    res.json({ success: true, data: exportPayload });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error exporting data' });
  }
};

