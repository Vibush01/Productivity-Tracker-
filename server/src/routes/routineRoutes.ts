import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  toggleRoutine,
  completeRoutine,
} from '../controllers/routineController.js';

const router = Router();

router.use(protect);

router.route('/').get(getRoutines).post(createRoutine);
router.route('/:id').get(getRoutine).put(updateRoutine).delete(deleteRoutine);
router.put('/:id/toggle', toggleRoutine);
router.post('/:id/complete', completeRoutine);

export default router;
