import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnv } from './helpers.js';

setupTestEnv();

test('analyzeWithCache returns cached analysis on cache hit and avoids queue', async () => {
  const { analyzeWithCache } = await import('../services/analysisService.js');
  const { redis } = await import('../cache/redisClient.js');
  const { analysisQueue } = await import('../workers/queues.js');

  const originalGet = redis.get;
  const originalAdd = analysisQueue.add;

  let queueCalled = false;
  redis.get = async () => JSON.stringify({ emotion: 'calm', keywords: ['sea'], summary: 'Summary' });
  analysisQueue.add = async () => {
    queueCalled = true;
    return { id: 'job-cached' };
  };

  const result = await analyzeWithCache('same text');

  assert.equal(result.fromCache, true);
  assert.equal(result.analysis.emotion, 'calm');
  assert.equal(queueCalled, false);

  redis.get = originalGet;
  analysisQueue.add = originalAdd;
});

test('analyzeWithCache enqueues async job on cache miss', async () => {
  const { analyzeWithCache } = await import('../services/analysisService.js');
  const { redis } = await import('../cache/redisClient.js');
  const { analysisQueue } = await import('../workers/queues.js');

  const originalGet = redis.get;
  const originalAdd = analysisQueue.add;

  let queueCalled = false;
  redis.get = async () => null;
  analysisQueue.add = async () => {
    queueCalled = true;
    return { id: 'job-miss' };
  };

  const result = await analyzeWithCache('cache miss text');

  assert.equal(result.queued, true);
  assert.equal(queueCalled, true);
  assert.equal(result.analysis, null);

  redis.get = originalGet;
  analysisQueue.add = originalAdd;
});

after(async () => {
  const { redis } = await import('../cache/redisClient.js');
  redis.disconnect();
});
