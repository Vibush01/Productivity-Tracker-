import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  frequency: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek?: number[];
    timesPerPeriod?: number;
    customInterval?: number;
  };
  goalType: 'boolean' | 'count' | 'duration';
  goalValue?: number;
  goalUnit?: string;
  tags: string[];
  isActive: boolean;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    icon: { type: String, required: true, default: '📌' },
    color: { type: String, required: true, default: '#00FFA3' },
    frequency: {
      type: { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], required: true },
      daysOfWeek: [{ type: Number }],
      timesPerPeriod: { type: Number },
      customInterval: { type: Number },
    },
    goalType: { type: String, enum: ['boolean', 'count', 'duration'], required: true },
    goalValue: { type: Number },
    goalUnit: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITemplate>('Template', templateSchema);
