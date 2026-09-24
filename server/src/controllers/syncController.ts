import { Request, Response } from 'express';
import Habit from '../models/Habit.js';
import Task from '../models/Task.js';
import TimerSession from '../models/TimerSession.js';

export const getChanges = async (req: Request, res: Response) => {
  try {
    const { since } = req.query;

    if (!since || typeof since !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid "since" timestamp query parameter' });
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid date format' });
    }

    const userId = req.user!._id;
    const query = { user: userId, updatedAt: { $gte: sinceDate } };

    // Fetch all changed documents since the timestamp
    const [habits, tasks, timerSessions] = await Promise.all([
      Habit.find(query),
      Task.find(query),
      TimerSession.find(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        habits,
        tasks,
        timerSessions,
        syncTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch changes for sync' });
  }
};
