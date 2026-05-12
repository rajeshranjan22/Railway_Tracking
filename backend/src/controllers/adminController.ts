import { Request, Response, NextFunction } from 'express';
import Train from '../models/Train';
import Station from '../models/Station';
import Route from '../models/Route';
import TrainSchedule from '../models/TrainSchedule';
import User from '../models/User';

// Station Management
export const createStation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    next(error);
  }
};

// Train Management
export const createTrain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json({ success: true, data: train });
  } catch (error) {
    next(error);
  }
};

// Route Management
export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
};

// Schedule & Delay Management
export const updateSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await TrainSchedule.findByIdAndUpdate(scheduleId, req.body, { new: true });
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // In a real app, we would emit a socket event here for live updates
    // io.to(`train_${schedule.train}`).emit('status_update', schedule);

    res.json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// Analytics (Mock)
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalTrains = await Train.countDocuments();
    const totalStations = await Station.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeSchedules = await TrainSchedule.countDocuments({ currentStatus: { $ne: 'Arrived' } });

    res.json({
      success: true,
      data: {
        totalTrains,
        totalStations,
        totalUsers,
        activeSchedules,
        revenue: 1250000, // Mock data
        delayStats: [
          { name: 'On Time', value: 85 },
          { name: 'Delayed', value: 15 }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
