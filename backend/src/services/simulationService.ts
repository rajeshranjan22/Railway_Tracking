import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Train from '../models/Train';
import Route from '../models/Route';
import Station from '../models/Station';

// Helper: Calculate distance using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};

// Helper: Linear Interpolation for coordinates
const interpolate = (start: number, end: number, fraction: number) => {
  return start + (end - start) * fraction;
};

class TrainSimulationService {
  private static instance: TrainSimulationService;
  private io: Server | null = null;
  private interval: NodeJS.Timeout | null = null;
  private activeSimulations: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): TrainSimulationService {
    if (!TrainSimulationService.instance) {
      TrainSimulationService.instance = new TrainSimulationService();
    }
    return TrainSimulationService.instance;
  }

  public init(io: Server) {
    this.io = io;
  }

  public async getActiveSimulation(trainNumber: string) {
    if (this.activeSimulations.has(trainNumber)) {
      return this.activeSimulations.get(trainNumber);
    }

    // On-demand simulation for unknown train numbers
    console.log(`Creating on-demand simulation for train ${trainNumber}...`);
    
    // Pick two random stations
    const stations = await Station.find();
    if (stations.length < 2) return null;

    const startStation = stations[Math.floor(Math.random() * stations.length)];
    let endStation = stations[Math.floor(Math.random() * stations.length)];
    while (startStation._id.toString() === endStation._id.toString()) {
      endStation = stations[Math.floor(Math.random() * stations.length)];
    }

    const sim = {
      trainId: new mongoose.Types.ObjectId(),
      trainNumber: trainNumber,
      trainName: `Express ${trainNumber}`,
      routeStops: [
        { station: startStation, stopNumber: 1, arrivalTime: '00:00', departureTime: '00:10', distance: 0, day: 1 },
        { station: endStation, stopNumber: 2, arrivalTime: '12:00', departureTime: '12:00', distance: 500, day: 1 },
      ],
      currentStopIndex: 0,
      currentLat: startStation.coordinates.latitude,
      currentLon: startStation.coordinates.longitude,
      speed: 75 + Math.floor(Math.random() * 20),
      status: 'On Time',
      delay: Math.floor(Math.random() * 10),
      weather: 'Clear',
      lastUpdate: Date.now()
    };

    this.activeSimulations.set(trainNumber, sim);
    return sim;
  }

  public async startSimulation() {
    console.log('Starting Train Simulation Engine...');
    
    // For demonstration, let's pick all active trains that have a route
    const routes = await Route.find().populate('train').populate('stops.station');
    
    for (const route of routes) {
      const train = route.train as any;
      if (!train || !train.isActive) continue;

      // Initialize simulation state
      this.activeSimulations.set(train.trainNumber, {
        trainId: train._id,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        routeStops: route.stops,
        currentStopIndex: 0,
        currentLat: (route.stops[0] as any).station.coordinates.latitude,
        currentLon: (route.stops[0] as any).station.coordinates.longitude,
        speed: 80, // base speed km/h
        status: 'On Time',
        delay: 0,
        weather: 'Clear',
        lastUpdate: Date.now()
      });
    }

    // Run tick every 5 seconds
    this.interval = setInterval(() => this.tick(), 5000);
  }

  private async tick() {
    if (!this.io) return;
    const now = Date.now();

    for (const [trainNumber, sim] of this.activeSimulations.entries()) {
      const currentStop = sim.routeStops[sim.currentStopIndex];
      const nextStopIndex = sim.currentStopIndex + 1;
      
      if (nextStopIndex >= sim.routeStops.length) {
         sim.status = 'Arrived';
         this.io.to(`train_${trainNumber}`).emit('train_update', {
            trainNumber,
            status: sim.status,
            lat: sim.currentLat,
            lon: sim.currentLon,
            currentStation: (currentStop.station as any).name,
            message: 'Train has reached destination.'
         });
         continue;
      }

      const nextStop = sim.routeStops[nextStopIndex];
      const nextStationCoords = (nextStop.station as any).coordinates;

      this.triggerRandomEvents(sim);

      const timeElapsedHours = ((now - sim.lastUpdate) / 1000) * 60 / 3600; 
      const distanceCovered = sim.speed * timeElapsedHours;
      const totalDistanceToNext = calculateDistance(
        sim.currentLat, sim.currentLon, 
        nextStationCoords.latitude, nextStationCoords.longitude
      );

      let fraction = totalDistanceToNext === 0 ? 1 : distanceCovered / totalDistanceToNext;
      
      if (fraction >= 1) {
        sim.currentStopIndex = nextStopIndex;
        sim.currentLat = nextStationCoords.latitude;
        sim.currentLon = nextStationCoords.longitude;
        sim.delay += Math.floor(Math.random() * 5);
        
        const newPlatform = Math.floor(Math.random() * 5) + 1;
        this.io.to(`train_${trainNumber}`).emit('platform_update', {
          trainNumber,
          station: (nextStop.station as any).name,
          platform: newPlatform,
          message: `Arriving at Platform ${newPlatform}`
        });

      } else {
        sim.currentLat = interpolate(sim.currentLat, nextStationCoords.latitude, fraction);
        sim.currentLon = interpolate(sim.currentLon, nextStationCoords.longitude, fraction);
      }

      sim.lastUpdate = now;
      const remainingDist = calculateDistance(sim.currentLat, sim.currentLon, nextStationCoords.latitude, nextStationCoords.longitude);
      const etaMinutes = (remainingDist / sim.speed) * 60 + sim.delay;

      this.io.to(`train_${trainNumber}`).emit('train_update', {
        trainNumber: sim.trainNumber,
        trainName: sim.trainName,
        lat: sim.currentLat,
        lon: sim.currentLon,
        speed: sim.speed,
        status: sim.status,
        weather: sim.weather,
        delay: sim.delay,
        nextStation: (nextStop.station as any).name,
        eta: Math.round(etaMinutes),
      });
    }
  }

  private triggerRandomEvents(sim: any) {
    const rand = Math.random();
    sim.speed = 80;
    sim.weather = 'Clear';
    sim.status = sim.delay > 15 ? 'Delayed' : 'On Time';

    if (rand < 0.05) {
      sim.weather = 'Heavy Rain';
      sim.speed = 40;
      sim.delay += 2;
    } else if (rand > 0.05 && rand < 0.10) {
      sim.weather = 'Fog';
      sim.speed = 30;
      sim.delay += 5;
    } else if (rand > 0.95) {
      sim.status = 'Signal Issue';
      sim.speed = 0;
      sim.delay += 10;
    }
  }

  public stopSimulation() {
    if (this.interval) clearInterval(this.interval);
    console.log('Train Simulation Engine Stopped.');
  }
}

export default TrainSimulationService;
