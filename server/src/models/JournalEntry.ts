import mongoose, { Schema } from 'mongoose';
import type { IJournalEntry } from '../types/index.js';

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    title: { type: String, maxlength: 200 },
    content: { type: String, required: [true, 'Journal content is required'], maxlength: 10000 },
    mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], required: true },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    linkedHabits: [{ type: Schema.Types.ObjectId, ref: 'Habit' }],
  },
  { timestamps: true }
);

journalEntrySchema.index({ userId: 1, date: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });
journalEntrySchema.index({ userId: 1, tags: 1 });

export default mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);
