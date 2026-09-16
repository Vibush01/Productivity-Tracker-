import mongoose, { Schema } from 'mongoose';
import type { ITimerSession } from '../types/index.js';

const timerSessionSchema = new Schema<ITimerSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['pomodoro', 'stopwatch', 'countdown'], required: true },
    linkedHabit: { type: Schema.Types.ObjectId, ref: 'Habit' },
    duration: { type: Number, required: true },        // planned duration in seconds
    actualDuration: { type: Number, required: true },  // actual elapsed in seconds
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    label: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

// Indexes for efficient time-range queries
timerSessionSchema.index({ userId: 1, startedAt: -1 });
timerSessionSchema.index({ userId: 1, type: 1, startedAt: -1 });

export default mongoose.model<ITimerSession>('TimerSession', timerSessionSchema);
