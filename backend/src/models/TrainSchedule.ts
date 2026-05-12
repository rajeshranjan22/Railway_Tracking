import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainSchedule extends Document {
  train: mongoose.Types.ObjectId;
  departureDate: Date;
  currentStation: mongoose.Types.ObjectId;
  nextStation: mongoose.Types.ObjectId;
  currentStatus: 'On Time' | 'Delayed' | 'Cancelled' | 'Departed' | 'Arrived';
  delayInMinutes: number;
  lastUpdated: Date;
  actualArrivalTime?: Date;
  actualDepartureTime?: Date;
  platformNumber?: number;
}

const TrainScheduleSchema: Schema = new Schema(
  {
    train: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
    departureDate: { type: Date, required: true },
    currentStation: { type: Schema.Types.ObjectId, ref: 'Station' },
    nextStation: { type: Schema.Types.ObjectId, ref: 'Station' },
    currentStatus: { 
      type: String, 
      enum: ['On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived'], 
      default: 'On Time' 
    },
    delayInMinutes: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    actualArrivalTime: { type: Date },
    actualDepartureTime: { type: Date },
    platformNumber: { type: Number },
  },
  { timestamps: true }
);

// Index for quick searching by train and date
TrainScheduleSchema.index({ train: 1, departureDate: 1 }, { unique: true });

export default mongoose.model<ITrainSchedule>('TrainSchedule', TrainScheduleSchema);
