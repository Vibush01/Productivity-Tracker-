import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types/index.js';

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 30 },
    icon: { type: String, default: '📁' },
    color: { type: String, default: '#39FF14' },
    order: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for unique category names per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const DEFAULT_CATEGORIES = [
  { name: 'Health', icon: '💪', color: '#39FF14', order: 0 },
  { name: 'Work', icon: '💼', color: '#00D1FF', order: 1 },
  { name: 'Personal', icon: '🏠', color: '#FFB800', order: 2 },
  { name: 'Learning', icon: '📚', color: '#A855F7', order: 3 },
  { name: 'Fitness', icon: '🏃', color: '#FF3B3B', order: 4 },
];

export default mongoose.model<ICategory>('Category', categorySchema);
