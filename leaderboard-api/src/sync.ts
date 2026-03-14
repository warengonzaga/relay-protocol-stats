#!/usr/bin/env node
/**
 * One-shot sync: fetch new Relay requests, upsert wallet_volume, update cursor.
 * Usage: pnpm run sync:dev
 */
import 'dotenv/config';
import { runSync } from './syncWorker.js';
import { closeDb } from './db/client.js';

async function main() {
  console.log('[sync] Starting Relay leaderboard sync...');
  const result = await runSync();
  console.log('[sync] Complete:', {
    pagesProcessed: result.pagesProcessed,
    requestsProcessed: result.requestsProcessed,
    walletsUpserted: result.walletsUpserted,
    lastTimestamp: result.lastTimestamp.toString(),
  });
  await closeDb();
  process.exit(0);
}

main().catch((err) => {
  console.error('[sync] Failed:', err);
  process.exit(1);
});
