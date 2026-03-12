import { JournalEntry } from '../models/JournalEntry.js';
import { analyzeJournalText } from '../services/geminiService.js';

// POST /api/journal
export async function createJournalEntry(req, res) {
  try {
    const { userId, ambience, text } = req.body;

    if (!userId || !ambience || !text) {
      return res.status(400).json({ error: 'userId, ambience, and text are required' });
    }

    let emotion = null;
    let keywords = [];
    let summary = null;

    try {
      const analysis = await analyzeJournalText(text);
      emotion = analysis.emotion;
      keywords = analysis.keywords;
      summary = analysis.summary;
    } catch (err) {
      console.error('Gemini analysis failed, storing entry without analysis:', err.message);
    }

    const entry = await JournalEntry.create({ userId, ambience, text, emotion, keywords, summary });
    res.status(201).json(entry);
  } catch (err) {
    console.error('createJournalEntry error:', err);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
}

// GET /api/journal/:userId
export async function getJournalEntries(req, res) {
  try {
    const { userId } = req.params;
    const entries = await JournalEntry.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (err) {
    console.error('getJournalEntries error:', err);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
}

// POST /api/journal/analyze
export async function analyzeEntry(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const result = await analyzeJournalText(text);
    res.json(result);
  } catch (err) {
    console.error('analyzeEntry error:', err);
    res.status(500).json({ error: 'Failed to analyze journal text' });
  }
}

// GET /api/journal/insights/:userId
export async function getInsights(req, res) {
  try {
    const { userId } = req.params;
    const entries = await JournalEntry.find({ userId }).sort({ createdAt: -1 }).lean();

    const totalEntries = entries.length;
    const emotionCounts = {};
    const ambienceCounts = {};
    const recentKeywords = [];

    for (const entry of entries) {
      if (entry.emotion) {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      }
      if (entry.ambience) {
        ambienceCounts[entry.ambience] = (ambienceCounts[entry.ambience] || 0) + 1;
      }
      if (entry.keywords) {
        for (const kw of entry.keywords) {
          if (!recentKeywords.includes(kw) && recentKeywords.length < 10) {
            recentKeywords.push(kw);
          }
        }
      }
    }

    const topEmotion = Object.keys(emotionCounts).length
      ? Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const mostUsedAmbience = Object.keys(ambienceCounts).length
      ? Object.entries(ambienceCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    res.json({ totalEntries, topEmotion, mostUsedAmbience, recentKeywords });
  } catch (err) {
    console.error('getInsights error:', err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
}
