import { redis } from '../cache/redisClient.js';
import { env } from '../config/env.js';
import { analysisQueue } from '../workers/queues.js';
import { createTextHash } from '../utils/hash.js';

function cacheKey(hash) {
  return `analysis:${hash}`;
}

export async function getCachedAnalysis(textHash) {
  const cached = await redis.get(cacheKey(textHash));
  return cached ? JSON.parse(cached) : null;
}

export async function cacheAnalysis(textHash, analysis) {
  await redis.set(cacheKey(textHash), JSON.stringify(analysis), 'EX', env.analysisCacheTtlSeconds);
}

export async function enqueueAnalysisJob({ text, entryId }) {
  const textHash = createTextHash(text);
  await analysisQueue.add('analyze-entry', { entryId, textHash, text }, { jobId: entryId || textHash });
  return { textHash };
}

export async function analyzeWithCache(rawText) {
  const textHash = createTextHash(rawText);
  const cached = await getCachedAnalysis(textHash);

  if (cached) {
    return { analysis: cached, textHash, fromCache: true };
  }

  const { textHash: queuedHash } = await enqueueAnalysisJob({ text: rawText });
  return { analysis: null, textHash: queuedHash, queued: true };
}
