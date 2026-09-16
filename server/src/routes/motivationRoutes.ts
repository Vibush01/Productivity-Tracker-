import { Router, Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDailyQuote, getRandomQuote, getAccountabilityMessage, getHonestyCheckPrompt } from '../services/motivationService.js';

const router = Router();

router.use(protect);

// @route GET /api/motivation/daily-quote
router.get('/daily-quote', (_req: Request, res: Response) => {
  res.json({ success: true, data: getDailyQuote() });
});

// @route GET /api/motivation/random-quote
router.get('/random-quote', (_req: Request, res: Response) => {
  res.json({ success: true, data: getRandomQuote() });
});

// @route GET /api/motivation/accountability
router.get('/accountability', (_req: Request, res: Response) => {
  res.json({ success: true, data: { message: getAccountabilityMessage() } });
});

// @route GET /api/motivation/honesty-check
router.get('/honesty-check', (_req: Request, res: Response) => {
  res.json({ success: true, data: { prompt: getHonestyCheckPrompt() } });
});

export default router;
