import { Router } from 'express';
import { getChanges } from '../controllers/syncController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All sync routes require authentication
router.use(protect);

router.get('/changes', getChanges);

export default router;
