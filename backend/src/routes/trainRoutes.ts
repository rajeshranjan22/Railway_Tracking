import { Router } from 'express';
import { getAllTrains, getTrainByNumber, searchTrains, getLiveStatus, getAllLiveStatus } from '../controllers/trainController';

const router = Router();

router.get('/', getAllTrains);
router.get('/search', searchTrains);
router.get('/:trainNumber', getTrainByNumber);
router.get('/live/all', getAllLiveStatus);
router.get('/live/:trainNumber/:date?', getLiveStatus);

export default router;
