import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, deleteAccount, exportData, savePushToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.get('/export', protect, exportData);
router.post('/push-token', protect, savePushToken);

export default router;
