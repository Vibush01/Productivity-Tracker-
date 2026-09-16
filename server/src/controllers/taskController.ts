import { Request, Response } from 'express';
import Task from '../models/Task.js';
import { awardXP, XP_REWARDS } from '../services/gamificationService.js';

// @route   GET /api/tasks
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priority, category, completed, dueDate, search } = req.query;
    const filter: any = { userId: req.user._id };

    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (completed === 'true') filter.completed = true;
    else if (completed === 'false') filter.completed = false;
    if (dueDate === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: start, $lte: end };
    } else if (dueDate === 'overdue') {
      filter.dueDate = { $lt: new Date() };
      filter.completed = false;
    } else if (dueDate === 'upcoming') {
      const next7 = new Date();
      next7.setDate(next7.getDate() + 7);
      filter.dueDate = { $gte: new Date(), $lte: next7 };
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('category', 'name icon color')
      .sort({ completed: 1, order: 1, dueDate: 1, createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching tasks' });
  }
};

// @route   POST /api/tasks
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData = { ...req.body, userId: req.user._id };

    // Set order to last position
    const lastTask = await Task.findOne({ userId: req.user._id, completed: false }).sort({ order: -1 });
    taskData.order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create(taskData);
    const populated = await task.populate('category', 'name icon color');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error creating task' });
  }
};

// @route   PUT /api/tasks/:id
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name icon color');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating task' });
  }
};

// @route   DELETE /api/tasks/:id
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting task' });
  }
};

// @route   PUT /api/tasks/:id/complete
export const completeTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;
    await task.save();

    // Award XP based on priority
    let xpGained = 0;
    let leveledUp = false;
    let newLevel = 0;

    if (task.completed) {
      const xpMap: Record<string, number> = {
        low: XP_REWARDS.TASK_COMPLETE_LOW,
        medium: XP_REWARDS.TASK_COMPLETE_MEDIUM,
        high: XP_REWARDS.TASK_COMPLETE_HIGH,
        urgent: XP_REWARDS.TASK_COMPLETE_URGENT,
      };
      const xp = xpMap[task.priority] || XP_REWARDS.TASK_COMPLETE_MEDIUM;
      const result = await awardXP(req.user._id, xp);
      xpGained = xp;
      leveledUp = result.leveledUp;
      newLevel = result.newLevel;
    }

    res.json({
      success: true,
      data: {
        task,
        xpGained,
        leveledUp,
        newLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error completing task' });
  }
};

// @route   PUT /api/tasks/:id/subtasks/:subtaskId/toggle
export const toggleSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    const subtask = (task.subtasks as any).id(req.params.subtaskId);
    if (!subtask) {
      res.status(404).json({ success: false, error: 'Subtask not found' });
      return;
    }

    subtask.completed = !subtask.completed;

    // Auto-complete task if all subtasks done
    const allDone = task.subtasks.every((s) => s.completed);
    if (allDone && task.subtasks.length > 0) {
      task.completed = true;
      task.completedAt = new Date();
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error toggling subtask' });
  }
};

// @route   PUT /api/tasks/reorder
export const reorderTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tasks } = req.body;
    if (!Array.isArray(tasks)) {
      res.status(400).json({ success: false, error: 'Invalid tasks array' });
      return;
    }

    await Promise.all(
      tasks.map(({ id, order }: { id: string; order: number }) =>
        Task.findOneAndUpdate({ _id: id, userId: req.user._id }, { order })
      )
    );

    res.json({ success: true, message: 'Tasks reordered' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error reordering tasks' });
  }
};
