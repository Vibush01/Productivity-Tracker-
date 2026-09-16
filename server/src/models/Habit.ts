import mongoose, { Schema } from 'mongoose';
import { IHabit } from '../types/index.js';

const frequencySchema = new Schema({
  type: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'daily' },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  timesPerPeriod: { type: Number, min: 1 },
  customInterval: { type: Number, min: 1 },
}, { _id: false });

const habitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Habit title is required'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, default: '✅' },
    color: { type: String, default: '#39FF14' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    frequency: { type: frequencySchema, default: () => ({ type: 'daily' }) },
    goalType: { type: String, enum: ['boolean', 'count', 'duration'], default: 'boolean' },
    goalValue: { type: Number },
    goalUnit: { type: String, trim: true },
    reminderTime: { type: String },
    isArchived: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, isArchived: 1 });

export default mongoose.model<IHabit>('Habit', habitSchema);
