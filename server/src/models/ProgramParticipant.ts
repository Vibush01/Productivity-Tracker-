import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgramParticipant extends Document {
  _id: Types.ObjectId;
  programId: Types.ObjectId;
  userId: Types.ObjectId;
  linkedHabitId?: Types.ObjectId;
  joinedAt: Date;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalDaysCompleted: number;
  lastLogDate?: Date;
}

const participantSchema = new Schema<IProgramParticipant>(
  {
    programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    linkedHabitId: { type: Schema.Types.ObjectId, ref: 'Habit' },
    joinedAt: { type: Date, default: Date.now },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    totalDaysCompleted: { type: Number, default: 0 },
    lastLogDate: { type: Date },
  },
  { timestamps: true }
);

participantSchema.index({ programId: 1, userId: 1 }, { unique: true });
participantSchema.index({ programId: 1, completionRate: -1 });

export default mongoose.model<IProgramParticipant>('ProgramParticipant', participantSchema);
