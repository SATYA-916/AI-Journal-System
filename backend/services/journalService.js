import { JournalEntry } from '../models/JournalEntry.js';
import { encryptText, decryptText } from '../utils/encryption.js';
import { createTextHash } from '../utils/hash.js';
import { enqueueAnalysisJob, getCachedAnalysis } from './analysisService.js';

function toPublicEntry(doc) {
  return {
    _id: doc._id,
    userId: doc.userId,
    ambience: doc.ambience,
    text: decryptText({ encryptedText: doc.encryptedText, iv: doc.iv, authTag: doc.authTag }),
    emotion: doc.emotion,
    keywords: doc.keywords,
    summary: doc.summary,
    analysisStatus: doc.analysisStatus,
    createdAt: doc.createdAt,
  };
}

export async function createEntry({ userId, ambience, text }) {
  const textHash = createTextHash(text);
  const encrypted = encryptText(text);
  const cachedAnalysis = await getCachedAnalysis(textHash);

  const payload = {
    userId,
    ambience,
    ...encrypted,
    textHash,
    emotion: cachedAnalysis?.emotion || null,
    keywords: cachedAnalysis?.keywords || [],
    summary: cachedAnalysis?.summary || null,
    analysisStatus: cachedAnalysis ? 'completed' : 'pending',
  };

  const entry = await JournalEntry.create(payload);

  if (!cachedAnalysis) {
    await enqueueAnalysisJob({ entryId: String(entry._id), text });
  }

  return toPublicEntry(entry.toObject());
}

export async function getEntriesForUser(userId) {
  const docs = await JournalEntry.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toPublicEntry);
}

export async function getInsightsForUser(userId) {
  const entries = await JournalEntry.find({ userId, analysisStatus: 'completed' }).sort({ createdAt: -1 }).lean();

  const totalEntries = entries.length;
  const emotionCounts = {};
  const ambienceCounts = {};
  const recentKeywords = [];

  for (const entry of entries) {
    if (entry.emotion) emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    if (entry.ambience) ambienceCounts[entry.ambience] = (ambienceCounts[entry.ambience] || 0) + 1;
    for (const kw of entry.keywords || []) {
      if (!recentKeywords.includes(kw) && recentKeywords.length < 10) recentKeywords.push(kw);
    }
  }

  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostUsedAmbience = Object.entries(ambienceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { totalEntries, topEmotion, mostUsedAmbience, recentKeywords };
}

export async function applyAnalysisToEntry(entryId, analysis) {
  await JournalEntry.findByIdAndUpdate(entryId, {
    emotion: analysis.emotion,
    keywords: analysis.keywords,
    summary: analysis.summary,
    analysisStatus: 'completed',
  });
}

export async function markAnalysisFailed(entryId) {
  await JournalEntry.findByIdAndUpdate(entryId, { analysisStatus: 'failed' });
}
