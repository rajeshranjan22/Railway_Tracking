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
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', coordinates: { latitude: 21.204, longitude: 72.831 }, platforms: 6 },
  { code: 'ADI', name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', coordinates: { latitude: 23.022, longitude: 72.571 }, platforms: 12 },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', coordinates: { latitude: 25.213, longitude: 75.864 }, platforms: 6 },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Station.deleteMany({});
    await Train.deleteMany({});
    await Route.deleteMany({});
    await TrainSchedule.deleteMany({});

    const createdStations = await Station.insertMany(stations);
    console.log('Stations seeded');

    // Mumbai Rajdhani (12951)
    const t1 = await Train.create({
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      type: 'Rajdhani',
      sourceStation: createdStations[1]._id,
      destinationStation: createdStations[0]._id,
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      classes: ['1A', '2A', '3A'],
      totalDistance: 1384,
    });

    await Route.create({
      train: t1._id,
      stops: [
        { station: createdStations[1]._id, stopNumber: 1, arrivalTime: '17:00', departureTime: '17:10', distance: 0, day: 1 },
        { station: createdStations[4]._id, stopNumber: 2, arrivalTime: '19:40', departureTime: '19:45', distance: 263, day: 1 },
        { station: createdStations[6]._id, stopNumber: 3, arrivalTime: '02:05', departureTime: '02:10', distance: 920, day: 2 },
        { station: createdStations[0]._id, stopNumber: 4, arrivalTime: '08:32', departureTime: '08:32', distance: 1384, day: 2 },
      ],
    });

    // August Kranti Rajdhani (12953)
    const t2 = await Train.create({
      trainNumber: '12953',
      trainName: 'August Kranti Express',
      type: 'Rajdhani',
      sourceStation: createdStations[1]._id,
      destinationStation: createdStations[0]._id,
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      classes: ['1A', '2A', '3A'],
      totalDistance: 1377,
    });

    await Route.create({
      train: t2._id,
      stops: [
        { station: createdStations[1]._id, stopNumber: 1, arrivalTime: '17:40', departureTime: '17:40', distance: 0, day: 1 },
        { station: createdStations[4]._id, stopNumber: 2, arrivalTime: '20:48', departureTime: '20:53', distance: 263, day: 1 },
        { station: createdStations[0]._id, stopNumber: 3, arrivalTime: '10:55', departureTime: '10:55', distance: 1377, day: 2 },
      ],
    });

    // Ahmedabad Shatabdi (12009)
    const t3 = await Train.create({
      trainNumber: '12009',
      trainName: 'MMCT-ADI Shatabdi Exp',
      type: 'Shatabdi',
      sourceStation: createdStations[1]._id,
      destinationStation: createdStations[5]._id,
      runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      classes: ['EC', 'CC'],
      totalDistance: 493,
    });

    await Route.create({
      train: t3._id,
      stops: [
        { station: createdStations[1]._id, stopNumber: 1, arrivalTime: '06:20', departureTime: '06:20', distance: 0, day: 1 },
        { station: createdStations[4]._id, stopNumber: 2, arrivalTime: '09:15', departureTime: '09:18', distance: 263, day: 1 },
        { station: createdStations[5]._id, stopNumber: 3, arrivalTime: '12:40', departureTime: '12:40', distance: 493, day: 1 },
      ],
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await TrainSchedule.insertMany([
      { train: t1._id, departureDate: today, currentStatus: 'On Time', delayInMinutes: 0 },
      { train: t2._id, departureDate: today, currentStatus: 'On Time', delayInMinutes: 0 },
      { train: t3._id, departureDate: today, currentStatus: 'On Time', delayInMinutes: 0 },
    ]);

    console.log('Trains, Routes and Schedules seeded');
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
