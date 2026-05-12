import mongoose, { Schema, Document } from 'mongoose';

export interface IStation extends Document {
  code: string;
  name: string;
  city: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  platforms: number;
}

const StationSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    platforms: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model<IStation>('Station', StationSchema);
