import { Request, Response } from 'express';
import Routine from '../models/Routine.js';
import Habit from '../models/Habit.js';
import Task from '../models/Task.js';
import { awardXP, XP_REWARDS } from '../services/gamificationService.js';

// @route   GET /api/routines
export const getRoutines = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;
    const filter: any = { userId: req.user._id };
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

    const routines = await Routine.find(filter).sort({ timeOfDay: 1, createdAt: -1 });

    // Populate item references
    const populated = await Promise.all(
      routines.map(async (routine) => {
        const itemsWithData = await Promise.all(
          routine.items.map(async (item) => {
            let refData: any = null;
            if (item.type === 'habit') {
              refData = await Habit.findById(item.refId).select('title icon color');
            } else if (item.type === 'task') {
              refData = await Task.findById(item.refId).select('title priority completed');
            }
            return { ...(item as any).toObject(), refData };
          })
        );
        return { ...routine.toObject(), items: itemsWithData };
      })
    );

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching routines' });
  }
};

// @route   GET /api/routines/:id
export const getRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user._id });
    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    // Populate item references
    const itemsWithData = await Promise.all(
      routine.items.map(async (item) => {
        let refData: any = null;
        if (item.type === 'habit') {
          refData = await Habit.findById(item.refId).select('title icon color goalType');
        } else if (item.type === 'task') {
          refData = await Task.findById(item.refId).select('title priority completed subtasks');
        }
            return { ...(item as any).toObject(), refData };
      })
    );

    res.json({ success: true, data: { ...routine.toObject(), items: itemsWithData } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching routine' });
  }
};

// @route   POST /api/routines
export const createRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routineData = { ...req.body, userId: req.user._id };
    const routine = await Routine.create(routineData);
    res.status(201).json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating routine' });
  }
};

// @route   PUT /api/routines/:id
export const updateRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user._id });
    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    const updated = await Routine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating routine' });
  }
};

// @route   DELETE /api/routines/:id
export const deleteRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user._id });
    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    await routine.deleteOne();
    res.json({ success: true, message: 'Routine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting routine' });
  }
};

// @route   PUT /api/routines/:id/toggle
export const toggleRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user._id });
    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    routine.isActive = !routine.isActive;
    await routine.save();
    res.json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error toggling routine' });
  }
};

// @route   POST /api/routines/:id/complete
export const completeRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user._id });
    if (!routine) {
      res.status(404).json({ success: false, error: 'Routine not found' });
      return;
    }

    // Award XP for completing a full routine
    const result = await awardXP(req.user._id, XP_REWARDS.ROUTINE_COMPLETE);

    res.json({
      success: true,
      data: {
        xpGained: XP_REWARDS.ROUTINE_COMPLETE,
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error completing routine' });
  }
};
