import mongoose, { Schema } from 'mongoose';
import type { IProgram } from '../types/index.js';

const programSchema = new Schema<IProgram>(
  {
    title: { type: String, required: [true, 'Program title is required'], trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    rules: { type: String, maxlength: 5000 },
    icon: { type: String, default: '🏆' },
    color: { type: String, default: '#39FF14' },
    habitToTrack: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipants: { type: Number },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

programSchema.index({ isActive: 1, startDate: 1 });
programSchema.index({ createdBy: 1 });

export default mongoose.model<IProgram>('Program', programSchema);
