import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getOverview,
  getWeeklyStats,
  getMonthlyStats,
  getHeatmap,
  getCategoryStats,
  getCalendarData,
  getWeeklySummary,
} from '../controllers/statsController.js';

const router = Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/weekly', getWeeklyStats);
router.get('/monthly', getMonthlyStats);
router.get('/heatmap', getHeatmap);
router.get('/categories', getCategoryStats);
router.get('/calendar/:year/:month', getCalendarData);
router.get('/weekly-summary', getWeeklySummary);

export default router;
