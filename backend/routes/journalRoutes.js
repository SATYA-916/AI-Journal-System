import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createJournalEntry,
  getJournalEntries,
  analyzeEntry,
  getInsights,
} from '../controllers/journalController.js';

const router = Router();

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many analyze requests. Please try again later.' },
});

// Note: specific routes must come before parameterized ones
router.post('/journal/analyze', analyzeLimiter, analyzeEntry);
router.get('/journal/insights/:userId', getInsights);
router.post('/journal', createJournalEntry);
router.get('/journal/:userId', getJournalEntries);

export default router;
