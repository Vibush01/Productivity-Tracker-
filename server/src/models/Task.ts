import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types/index.js';

const subtaskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: true });

const recurrenceSchema = new Schema({
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  interval: { type: Number, default: 1 },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  endDate: { type: Date },
}, { _id: false });

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: { type: Date },
    dueTime: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurrence: { type: recurrenceSchema },
    subtasks: [subtaskSchema],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for efficient queries
taskSchema.index({ userId: 1, completed: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
