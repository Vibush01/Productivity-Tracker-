import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getProgramLeaderboard,
} from '../controllers/leaderboardController.js';

const router = Router();

router.use(protect);

router.get('/global', getGlobalLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/program/:id', getProgramLeaderboard);

export default router;
