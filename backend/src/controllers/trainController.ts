import { Request, Response, NextFunction } from 'express';
import Train from '../models/Train';
import Station from '../models/Station';
import Route from '../models/Route';
import TrainSchedule from '../models/TrainSchedule';

export const getAllTrains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trains = await Train.find().populate('sourceStation destinationStation');
    res.json({ success: true, count: trains.length, data: trains });
  } catch (error) {
    next(error);
  }
};

export const getTrainByNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainNumber } = req.params;
    const train = await Train.findOne({ trainNumber }).populate('sourceStation destinationStation');
    
    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const route = await Route.findOne({ train: train._id }).populate('stops.station');
    
    res.json({ success: true, data: { train, route } });
  } catch (error) {
    next(error);
  }
};

export const searchTrains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'Please provide from and to station codes' });
    }

    const sourceStation = await Station.findOne({ code: (from as string).toUpperCase() });
    const destStation = await Station.findOne({ code: (to as string).toUpperCase() });

    if (!sourceStation || !destStation) {
      return res.status(404).json({ message: 'Station not found' });
    }

    // This is a simplified search. In a real system, we would query the Route model
    // to find trains that have both stations in their stops in the correct order.
    const routes = await Route.find({
      $and: [
        { 'stops.station': sourceStation._id },
        { 'stops.station': destStation._id }
      ]
    }).populate('train');

    // Filter routes where source stop number < destination stop number
    const validTrains = routes.filter(route => {
      const sourceStop = route.stops.find(stop => stop.station.toString() === sourceStation._id.toString());
      const destStop = route.stops.find(stop => stop.station.toString() === destStation._id.toString());
      return sourceStop && destStop && sourceStop.stopNumber < destStop.stopNumber;
    }).map(route => route.train);

    res.json({ success: true, count: validTrains.length, data: validTrains });
  } catch (error) {
    next(error);
  }
};

export const getLiveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainNumber, date } = req.params;
    const train = await Train.findOne({ trainNumber });

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    const schedule = await TrainSchedule.findOne({
      train: train._id,
      departureDate: queryDate
    }).populate('currentStation nextStation');

    if (!schedule) {
      return res.status(404).json({ message: 'Live status not available for this date' });
    }

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};
