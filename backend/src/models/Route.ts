import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteStop {
  station: mongoose.Types.ObjectId;
  stopNumber: number;
  arrivalTime: string; // HH:mm
  departureTime: string; // HH:mm
  haltTime: number; // in minutes
  distance: number; // cumulative distance from source
  day: number; // 1, 2, 3...
}

export interface IRoute extends Document {
  train: mongoose.Types.ObjectId;
  stops: IRouteStop[];
}

const RouteSchema: Schema = new Schema(
  {
    train: { type: Schema.Types.ObjectId, ref: 'Train', required: true, unique: true },
    stops: [
      {
        station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
        stopNumber: { type: Number, required: true },
        arrivalTime: { type: String, required: true },
        departureTime: { type: String, required: true },
        haltTime: { type: Number, default: 0 },
        distance: { type: Number, required: true },
        day: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IRoute>('Route', RouteSchema);
