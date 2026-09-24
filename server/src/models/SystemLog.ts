import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
  level: 'info' | 'warn' | 'error';
  message: string;
  meta: Record<string, any>;
  route?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const systemLogSchema = new Schema<ISystemLog>(
  {
    level: { type: String, enum: ['info', 'warn', 'error'], required: true },
    message: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    route: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISystemLog>('SystemLog', systemLogSchema);
