import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  saveSession,
  getSessions,
  getTimerStats,
  deleteSession,
} from '../controllers/timerController.js';

const router = Router();

router.use(protect);

router.route('/sessions')
  .get(getSessions)
  .post(saveSession);

router.get('/stats', getTimerStats);
router.delete('/sessions/:id', deleteSession);

export default router;
