import mongoose, { Schema } from 'mongoose';
import { IHabitLog } from '../types/index.js';

const habitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: true },
    value: { type: Number },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Ensure only one log per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model<IHabitLog>('HabitLog', habitLogSchema);
