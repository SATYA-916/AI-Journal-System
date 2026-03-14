import { Router } from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  analyzeEntry,
  getInsights,
} from '../controllers/journalController.js';
import { analyzeLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { analyzeSchema, createEntrySchema } from '../validators/journalValidators.js';

const router = Router();

router.use(requireAuth);
router.post('/journal/analyze', analyzeLimiter, validateRequest(analyzeSchema), analyzeEntry);
router.get('/journal/insights', getInsights);
router.post('/journal', validateRequest(createEntrySchema), createJournalEntry);
router.get('/journal', getJournalEntries);

export default router;
