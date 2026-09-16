import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/index.js';

const userSettingsSchema = new Schema({
  timezone: { type: String, default: 'Asia/Kolkata' },
  weekStartsOn: { type: Number, enum: [0, 1], default: 1 },
  dateFormat: { type: String, default: 'DD/MM/YYYY' },
  reminderSound: { type: Boolean, default: true },
  anonymousOnLeaderboard: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    settings: { type: userSettingsSchema, default: () => ({}) },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
