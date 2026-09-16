import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  toggleSubtask,
  reorderTasks,
} from '../controllers/taskController.js';

const router = Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.put('/reorder', reorderTasks);
router.route('/:id').put(updateTask).delete(deleteTask);
router.put('/:id/complete', completeTask);
router.put('/:id/subtasks/:subtaskId/toggle', toggleSubtask);

export default router;
