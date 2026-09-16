import { Request, Response } from 'express';
import Category from '../models/Category.js';
import Habit from '../models/Habit.js';

// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({ order: 1 });

    // Get habit count per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const habitCount = await Habit.countDocuments({ category: cat._id, isArchived: false });
        return { ...cat.toObject(), habitCount };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching categories' });
  }
};

// @route   POST /api/categories
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const lastCategory = await Category.findOne({ userId: req.user._id }).sort({ order: -1 });
    const order = lastCategory ? lastCategory.order + 1 : 0;

    const category = await Category.create({
      userId: req.user._id,
      name,
      icon: icon || '📁',
      color: color || '#39FF14',
      order,
    });

    res.status(201).json({ success: true, data: { ...category.toObject(), habitCount: 0 } });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ success: false, error: 'Category with this name already exists' });
      return;
    }
    res.status(500).json({ success: false, error: 'Server error creating category' });
  }
};

// @route   PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error updating category' });
  }
};

// @route   DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }

    // Remove category reference from habits
    await Habit.updateMany({ category: category._id }, { $unset: { category: '' } });
    await category.deleteOne();

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error deleting category' });
  }
};
