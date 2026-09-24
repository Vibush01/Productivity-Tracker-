import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  getUserDetail,
  updateUserRole,
  toggleDisableUser,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getQuotes,
  createQuote,
  deleteQuote,
  sendBroadcast,
  getSystemLogs
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

// Templates
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Quotes
router.get('/quotes', getQuotes);
router.post('/quotes', createQuote);
router.delete('/quotes/:id', deleteQuote);

// Broadcast & Logs
router.post('/broadcast', sendBroadcast);
router.get('/logs', getSystemLogs);

export default router;
