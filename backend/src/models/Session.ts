import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  isValid: boolean;
}

const SessionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    userAgent: { type: String, default: 'unknown' },
    ipAddress: { type: String, default: 'unknown' },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index to automatically remove expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', SessionSchema);
