import mongoose, { Schema, Document } from 'mongoose';

export interface ITrain extends Document {
  trainNumber: string;
  trainName: string;
  type: string; // Express, Superfast, Local, etc.
  sourceStation: mongoose.Types.ObjectId;
  destinationStation: mongoose.Types.ObjectId;
  runsOn: string[]; // ['Mon', 'Tue', ...]
  classes: string[]; // ['1A', '2A', '3A', 'SL', '2S']
  totalDistance: number;
  isActive: boolean;
}

const TrainSchema: Schema = new Schema(
  {
    trainNumber: { type: String, required: true, unique: true },
    trainName: { type: String, required: true },
    type: { type: String, required: true },
    sourceStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    destinationStation: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    runsOn: [{ type: String }],
    classes: [{ type: String }],
    totalDistance: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITrain>('Train', TrainSchema);
