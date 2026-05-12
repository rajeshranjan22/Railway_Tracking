import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  train: mongoose.Types.ObjectId;
}

const BookmarkSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    train: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
  },
  { timestamps: true }
);

// Unique bookmark per user and train
BookmarkSchema.index({ user: 1, train: 1 }, { unique: true });

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
