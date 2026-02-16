#!/usr/bin/env node
/**
 * Background cron: runs sync every 10 minutes, snapshot every hour.
 * Start alongside or instead of the API server.
 *
 * Usage: pnpm run cron:dev
 */
import 'dotenv/config';
import cron from 'node-cron';
import { runSync } from './syncWorker.js';
import { runSnapshot } from './snapshotJob.js';

let syncRunning = false;
let snapshotRunning = false;

// ── Sync: every 10 minutes ─────────────────────────────────────────
cron.schedule('*/10 * * * *', async () => {
  if (syncRunning) {
    console.log('[cron] Sync already running, skipping.');
    return;
  }
  syncRunning = true;
  try {
    console.log('[cron] Starting sync...');
    const result = await runSync();
    console.log(`[cron] Sync done: ${result.pagesProcessed} pages, ${result.requestsProcessed} requests, ${result.walletsUpserted} upserts`);
  } catch (err) {
    console.error('[cron] Sync error:', err);
  } finally {
    syncRunning = false;
  }
});

// ── Snapshot: every hour at :05 ─────────────────────────────────────
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

// Run initial sync + snapshot on startup
(async () => {
  try {
    console.log('[cron] Initial sync...');
    syncRunning = true;
    const syncResult = await runSync();
    console.log(`[cron] Initial sync done: ${syncResult.pagesProcessed} pages, ${syncResult.walletsUpserted} upserts`);
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
