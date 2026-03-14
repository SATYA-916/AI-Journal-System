import { redis } from '../cache/redisClient.js';
import { env } from '../config/env.js';
import { analysisQueue } from '../workers/queues.js';
import { analyzeJournalText } from './geminiService.js';
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

export async function analyzeWithCache(rawText) {
  const textHash = createTextHash(rawText);
  const cached = await getCachedAnalysis(textHash);
  if (cached) return { analysis: cached, textHash, fromCache: true };

  const lockKey = `analysis-lock:${textHash}`;
  const lockAcquired = await redis.set(lockKey, '1', 'NX', 'EX', env.dedupeLockTtlSeconds);
  if (!lockAcquired) {
    await analysisQueue.add('analyze', { textHash, text: rawText }, { jobId: textHash });
    return { analysis: null, textHash, queued: true };
  }

  try {
    const analysis = await analyzeJournalText(rawText);
    await cacheAnalysis(textHash, analysis);
    return { analysis, textHash, fromCache: false };
  } finally {
    await redis.del(lockKey);
  }
}
