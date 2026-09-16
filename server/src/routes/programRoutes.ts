import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  createProgram,
  updateProgram,
  deleteProgram,
  getAdminPrograms,
  getPrograms,
  getMyPrograms,
  getProgramDetail,
  joinProgram,
  leaveProgram,
} from '../controllers/programController.js';

const router = Router();

router.use(protect);

// User endpoints (order matters — specific routes before :id)
router.get('/my', getMyPrograms);
router.get('/', getPrograms);
router.get('/:id', getProgramDetail);
router.post('/:id/join', joinProgram);
router.post('/:id/leave', leaveProgram);

// Admin endpoints
router.get('/admin/all', adminOnly, getAdminPrograms);
router.post('/', adminOnly, createProgram);
router.put('/:id', adminOnly, updateProgram);
router.delete('/:id', adminOnly, deleteProgram);

export default router;
