import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  getUserDetail,
  updateUserRole,
  toggleDisableUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = Router();

// All routes require auth + admin
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/disable', toggleDisableUser);

export default router;
