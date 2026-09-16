import mongoose, { Schema } from 'mongoose';
import { IRoutine } from '../types/index.js';

const routineItemSchema = new Schema({
  type: { type: String, enum: ['habit', 'task'], required: true },
  refId: { type: Schema.Types.ObjectId, required: true },
  order: { type: Number, default: 0 },
  duration: { type: Number }, // estimated minutes
}, { _id: true });

const routineSchema = new Schema<IRoutine>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Routine name is required'], trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    icon: { type: String, default: '📋' },
    color: { type: String, default: '#39FF14' },
    timeOfDay: { type: String, enum: ['morning', 'afternoon', 'evening', 'night'], default: 'morning' },
    startTime: { type: String },
    items: [routineItemSchema],
    daysActive: [{ type: Number, min: 0, max: 6 }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

routineSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IRoutine>('Routine', routineSchema);
