import { createWorker } from './queues.js';
import { analyzeJournalText } from '../services/geminiService.js';
import { cacheAnalysis, getCachedAnalysis } from '../services/analysisService.js';
import { applyAnalysisToEntry, markAnalysisFailed } from '../services/journalService.js';

export function startAnalysisWorker() {
  const worker = createWorker(async (job) => {
    const { entryId, textHash, text } = job.data;

    const cached = await getCachedAnalysis(textHash);
    const analysis = cached || (await analyzeJournalText(text));
    if (!cached) {
      await cacheAnalysis(textHash, analysis);
    }

    if (entryId) {
      await applyAnalysisToEntry(entryId, analysis);
    }

    return { ok: true };
  });

  worker.on('failed', async (job, err) => {
    console.error('Analysis job failed:', err.message);
    if (job?.data?.entryId) await markAnalysisFailed(job.data.entryId);
  });

  return worker;
}
