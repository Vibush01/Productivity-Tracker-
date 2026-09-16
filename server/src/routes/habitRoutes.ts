import { Router } from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  deleteLog,
  getHabitLogs,
  reorderHabits,
  archiveHabit,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes are protected
router.use(protect);

router.route('/').get(getHabits).post(createHabit);
router.put('/reorder', reorderHabits);
router.route('/:id').put(updateHabit).delete(deleteHabit);
router.post('/:id/log', logHabit);
router.delete('/:id/log/:date', deleteLog);
router.get('/:id/logs', getHabitLogs);
router.put('/:id/archive', archiveHabit);

export default router;
