import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cron from 'node-cron';
import leaderboardRoutes from './routes/leaderboard.js';
import { runSync } from './syncWorker.js';
import { runSnapshot } from './snapshotJob.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const ENABLE_CRON = process.env.DISABLE_CRON !== 'true';

// ── CORS ────────────────────────────────────────────────────────────
const allowedOrigins: string[] = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/leaderboard', leaderboardRoutes);

// ── Start server ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Leaderboard API listening on http://localhost:${PORT}`);

  if (!ENABLE_CRON) {
    console.log('[server] Cron disabled (DISABLE_CRON=true).');
    return;
  }

  // ── Cron: sync every 10 minutes, snapshot every hour ────────────
  let syncRunning = false;
  let snapshotRunning = false;

  cron.schedule('*/10 * * * *', async () => {
    if (syncRunning) {
      console.log('[cron] Sync already running, skipping.');
      return;
    }
    syncRunning = true;
    try {
      console.log('[cron] Starting sync...');
      const result = await runSync();
      console.log(`[cron] Sync done: ${result.pagesProcessed} pages, ${result.requestsProcessed} requests, ${result.walletsUpserted} upserts${result.stoppedEarly ? ' (stopped early, will resume)' : ''}`);
    } catch (err) {
      console.error('[cron] Sync error:', err);
    } finally {
      syncRunning = false;
    }
  });

  cron.schedule('5 * * * *', async () => {
    if (snapshotRunning) {
      console.log('[cron] Snapshot already running, skipping.');
      return;
    }
    snapshotRunning = true;
    try {
      console.log('[cron] Starting snapshot...');
      const count = await runSnapshot();
      console.log(`[cron] Snapshot done: ${count} rows.`);
    } catch (err) {
      console.error('[cron] Snapshot error:', err);
    } finally {
      snapshotRunning = false;
    }
  });

  console.log('[cron] Scheduler started. Sync every 10 min, snapshot every hour at :05.');

  // Initial sync + snapshot on startup
  (async () => {
    try {
      console.log('[cron] Initial sync...');
      syncRunning = true;
      const syncResult = await runSync();
      console.log(`[cron] Initial sync done: ${syncResult.pagesProcessed} pages, ${syncResult.walletsUpserted} upserts${syncResult.stoppedEarly ? ' (stopped early, will resume)' : ''}`);
      syncRunning = false;

      console.log('[cron] Initial snapshot...');
      snapshotRunning = true;
      const snapCount = await runSnapshot();
      console.log(`[cron] Initial snapshot done: ${snapCount} rows.`);
      snapshotRunning = false;
    } catch (err) {
      console.error('[cron] Initial run error:', err);
      syncRunning = false;
      snapshotRunning = false;
    }
  })();
});
