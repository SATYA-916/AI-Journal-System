import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnv } from './helpers.js';

setupTestEnv();

test('createEntry encrypts text, stores entry, and enqueues async analysis job', async () => {
  const { createEntry } = await import('../services/journalService.js');
  const { JournalEntry } = await import('../models/JournalEntry.js');
  const { redis } = await import('../cache/redisClient.js');
  const { analysisQueue } = await import('../workers/queues.js');

  const originalCreate = JournalEntry.create;
  const originalRedisGet = redis.get;
  const originalQueueAdd = analysisQueue.add;

  let queueCalled = false;
  let capturedPayload = null;

  redis.get = async () => null;
  analysisQueue.add = async (_name, payload) => {
    queueCalled = true;
    capturedPayload = payload;
    return { id: 'job-1' };
  };

  JournalEntry.create = async (payload) => ({
    ...payload,
    _id: '507f1f77bcf86cd799439012',
    createdAt: new Date().toISOString(),
    toObject() {
      return this;
    },
  });

  const created = await createEntry({
    userId: '507f1f77bcf86cd799439013',
    ambience: 'forest',
    text: 'My private journal text',
  });

  assert.equal(created.text, 'My private journal text');
  assert.equal(created.analysisStatus, 'pending');
  assert.equal(queueCalled, true);
  assert.equal(capturedPayload.entryId, '507f1f77bcf86cd799439012');

  JournalEntry.create = originalCreate;
  redis.get = originalRedisGet;
  analysisQueue.add = originalQueueAdd;
});

after(async () => {
  const { redis } = await import('../cache/redisClient.js');
  redis.disconnect();
});
