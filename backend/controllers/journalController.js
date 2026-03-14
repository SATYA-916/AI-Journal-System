import { analyzeWithCache } from '../services/analysisService.js';
import { createEntry, getEntriesForUser, getInsightsForUser } from '../services/journalService.js';

export async function createJournalEntry(req, res, next) {
  try {
    const { ambience, text } = req.validated.body;
    const entry = await createEntry({ userId: req.user.id, ambience, text });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getJournalEntries(req, res, next) {
  try {
    const entries = await getEntriesForUser(req.user.id);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function analyzeEntry(req, res, next) {
  try {
    const { text } = req.validated.body;
    const result = await analyzeWithCache(text);
    if (result.analysis) {
      return res.json({ ...result.analysis, cached: result.fromCache });
    }
    return res.status(202).json({ message: 'Analysis queued', textHash: result.textHash });
  } catch (err) {
    next(err);
  }
}

export async function getInsights(req, res, next) {
  try {
    const insights = await getInsightsForUser(req.user.id);
    res.json(insights);
  } catch (err) {
    next(err);
  }
}
