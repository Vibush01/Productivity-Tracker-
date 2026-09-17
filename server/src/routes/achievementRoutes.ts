import { Router } from 'express';
import { getAchievements, checkAchievements } from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getAchievements);
router.post('/check', protect, checkAchievements);

export default router;
