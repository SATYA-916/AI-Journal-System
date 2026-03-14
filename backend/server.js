import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { startAnalysisWorker } from './workers/analysisWorker.js';

async function bootstrap() {
  await connectDatabase();
  startAnalysisWorker();
  const app = createApp();
  app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
