import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getMoodStats,
} from '../controllers/journalController.js';

const router = Router();

router.use(protect);

// Mood stats must be before :id to avoid conflict
router.get('/mood-stats', getMoodStats);

router.route('/')
  .get(getEntries)
  .post(createEntry);

router.route('/:id')
  .get(getEntry)
  .put(updateEntry)
  .delete(deleteEntry);

export default router;
