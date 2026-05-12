import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'delay' | 'platform_change' | 'schedule_update' | 'general';
  title: string;
  message: string;
  train?: mongoose.Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['delay', 'platform_change', 'schedule_update', 'general'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    train: { type: Schema.Types.ObjectId, ref: 'Train' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
