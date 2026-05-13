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

// Analytics
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalTrains = await Train.countDocuments();
    const totalStations = await Station.countDocuments();
    const totalUsers = await User.countDocuments();
    const activeTrains = await TrainSchedule.countDocuments({ currentStatus: { $in: ['Running', 'Delayed'] } });
    const delayedTrains = await TrainSchedule.countDocuments({ currentStatus: 'Delayed' });
    
    // Calculate on-time percentage
    const onTimeTrains = await TrainSchedule.countDocuments({ currentStatus: 'Running', delay: 0 });
    const totalSchedules = await TrainSchedule.countDocuments();
    const onTimePercentage = totalSchedules > 0 ? Math.round((onTimeTrains / totalSchedules) * 100) : 100;

    res.json({
      success: true,
      data: {
        // KPIs
        totalTrains,
        totalStations,
        totalUsers,
        activeTrains,
        delayedTrains,
        onTimePercentage,
        systemUptime: 99.98,
        revenue: 1250000,

        // Daily Active Trains (Mocked time series for 7 days)
        dailyActiveTrains: [
          { date: 'Mon', count: 32 },
          { date: 'Tue', count: 35 },
          { date: 'Wed', count: 38 },
          { date: 'Thu', count: 34 },
          { date: 'Fri', count: 42 },
          { date: 'Sat', count: 45 },
          { date: 'Sun', count: 40 },
        ],

        // Most Delayed Routes
        delayedRoutes: [
          { route: 'NDLS-MUM', delay: 45 },
          { route: 'KOL-NDLS', delay: 30 },
          { route: 'BLR-HYD', delay: 25 },
          { route: 'MUM-PNE', delay: 15 },
          { route: 'CHE-BLR', delay: 10 },
        ],

        // Average Delay Trends (Mocked for 6 months)
        delayTrends: [
          { month: 'Jan', avgDelay: 12 },
          { month: 'Feb', avgDelay: 10 },
          { month: 'Mar', avgDelay: 15 },
          { month: 'Apr', avgDelay: 8 },
          { month: 'May', avgDelay: 14 },
          { month: 'Jun', avgDelay: 11 },
        ],

        // Station Traffic
        stationTraffic: [
          { station: 'NDLS', count: 1200 },
          { station: 'CSMT', count: 950 },
          { station: 'SBC', count: 800 },
          { station: 'HWH', count: 1100 },
          { station: 'MAS', count: 700 },
        ],

        // User Activity
        userActivity: [
          { day: 'Mon', users: 400 },
          { day: 'Tue', users: 450 },
          { day: 'Wed', users: 420 },
          { day: 'Thu', users: 480 },
          { day: 'Fri', users: 550 },
          { day: 'Sat', users: 600 },
          { day: 'Sun', users: 500 },
        ],

        // Popular Searches
        popularSearches: [
          { term: 'Rajdhani', count: 150 },
          { term: 'Shatabdi', count: 120 },
          { term: 'Mumbai Central', count: 90 },
          { term: 'Chennai', count: 80 },
          { term: 'Vande Bharat', count: 200 },
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
