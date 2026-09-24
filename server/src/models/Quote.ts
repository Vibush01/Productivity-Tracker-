import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  text: string;
  author: string;
  category: string;
  isActive: boolean;
}

const quoteSchema = new Schema<IQuote>(
  {
    text: { type: String, required: true },
    author: { type: String, default: 'Unknown' },
    category: { type: String, default: 'Motivation' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuote>('Quote', quoteSchema);
