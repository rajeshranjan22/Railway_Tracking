import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Station from '../models/Station';
import Train from '../models/Train';
import Route from '../models/Route';
import TrainSchedule from '../models/TrainSchedule';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/railway-tracking';

const stations = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', coordinates: { latitude: 28.643, longitude: 77.222 }, platforms: 16 },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', coordinates: { latitude: 18.969, longitude: 72.819 }, platforms: 9 },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', coordinates: { latitude: 26.454, longitude: 80.351 }, platforms: 10 },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', coordinates: { latitude: 22.583, longitude: 88.341 }, platforms: 23 },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Station.deleteMany({});
    await Train.deleteMany({});
    await Route.deleteMany({});
    await TrainSchedule.deleteMany({});

    // Insert Stations
    const createdStations = await Station.insertMany(stations);
    console.log('Stations seeded');

    // Create a Train
    const train = await Train.create({
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      type: 'Rajdhani',
      sourceStation: createdStations[1]._id, // Mumbai
      destinationStation: createdStations[0]._id, // Delhi
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      classes: ['1A', '2A', '3A'],
      totalDistance: 1384,
    });
    console.log('Train seeded');

    // Create a Route
    await Route.create({
      train: train._id,
      stops: [
        { station: createdStations[1]._id, stopNumber: 1, arrivalTime: '17:00', departureTime: '17:10', distance: 0, day: 1 },
        { station: createdStations[2]._id, stopNumber: 2, arrivalTime: '06:00', departureTime: '06:10', distance: 900, day: 2 },
        { station: createdStations[0]._id, stopNumber: 3, arrivalTime: '08:30', departureTime: '08:40', distance: 1384, day: 2 },
      ],
    });
    console.log('Route seeded');

    // Create a Schedule for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await TrainSchedule.create({
      train: train._id,
      departureDate: today,
      currentStation: createdStations[1]._id,
      nextStation: createdStations[2]._id,
      currentStatus: 'On Time',
      delayInMinutes: 0,
    });
    console.log('Schedule seeded');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
