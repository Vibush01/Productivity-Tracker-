import { Request, Response } from 'express';
import JournalEntry from '../models/JournalEntry.js';
import { awardXP } from '../services/gamificationService.js';

// @route   GET /api/journal
// @desc    Get journal entries with optional filters
export const getEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, mood, tag, limit = '20', page = '1' } = req.query;
    const filter: any = { userId: req.user._id };

    if (mood) filter.mood = mood;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { content: { $regex: search as string, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      JournalEntry.find(filter)
        .populate('linkedHabits', 'title icon color')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      JournalEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching entries' });
  }
};

// @route   GET /api/journal/:id
// @desc    Get a single entry
export const getEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('linkedHabits', 'title icon color');
    if (!entry) {
      res.status(404).json({ success: false, error: 'Entry not found' });
      return;
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching entry' });
  }
};

// @route   POST /api/journal
// @desc    Create a new journal entry
export const createEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, title, content, mood, tags, linkedHabits } = req.body;

    if (!content || !mood) {
      res.status(400).json({ success: false, error: 'Content and mood are required' });
      return;
    }

    const entry = await JournalEntry.create({
      userId: req.user._id,
      date: date || new Date(),
      title, content, mood,
      tags: tags || [],
      linkedHabits: linkedHabits || [],
    });

    // Award XP for journaling
    const xpResult = await awardXP(req.user._id, 15);

    const populated = await entry.populate('linkedHabits', 'title icon color');

    res.status(201).json({
      success: true,
      data: populated,
      xpGained: 15,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating entry' });
  }
};

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
export const updateEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('linkedHabits', 'title icon color');

    if (!entry) {
      res.status(404).json({ success: false, error: 'Entry not found' });
      return;
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating entry' });
  }
};

// @route   DELETE /api/journal/:id
// @desc    Delete a journal entry
export const deleteEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      res.status(404).json({ success: false, error: 'Entry not found' });
      return;
    }
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting entry' });
  }
};

// @route   GET /api/journal/mood-stats
// @desc    Get mood distribution over time
export const getMoodStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const moodStats = await JournalEntry.aggregate([
      { $match: { userId: req.user._id, date: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
        },
      },
    ]);

    const moodTimeline = await JournalEntry.find({
      userId: req.user._id,
      date: { $gte: daysAgo },
    })
      .select('date mood')
      .sort({ date: 1 });

    res.json({
      success: true,
      data: {
        distribution: moodStats,
        timeline: moodTimeline,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching mood stats' });
  }
};
