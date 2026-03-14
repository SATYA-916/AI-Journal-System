import { Queue, Worker } from 'bullmq';
import { redis } from '../cache/redisClient.js';

const connection = redis.duplicate();

export const analysisQueue = new Queue('journal-analysis', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  },
});

export function createWorker(processor) {
  return new Worker('journal-analysis', processor, { connection: redis.duplicate(), concurrency: 10 });
}
