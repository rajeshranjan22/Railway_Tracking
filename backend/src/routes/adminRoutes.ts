import { Router } from 'express';
import { createStation, createTrain, createRoute, updateSchedule, getAnalytics } from '../controllers/adminController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = Router();

// Apply protection to all admin routes
router.use(protect);
router.use(admin);

router.post('/stations', createStation);
router.post('/trains', createTrain);
router.post('/routes', createRoute);
router.put('/schedules/:scheduleId', updateSchedule);
router.get('/analytics', getAnalytics);

export default router;
