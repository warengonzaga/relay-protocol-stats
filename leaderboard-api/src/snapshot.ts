#!/usr/bin/env node
/**
 * One-shot snapshot: rebuild leaderboard_top_100k from wallet_volume.
 * Usage: pnpm run snapshot:dev
 */
import 'dotenv/config';
import { runSnapshot } from './snapshotJob.js';
import { closeDb } from './db/client.js';

async function main() {
  console.log('[snapshot] Rebuilding leaderboard_top_100k...');
  const count = await runSnapshot();
  console.log(`[snapshot] Done. ${count} rows in leaderboard_top_100k.`);
  await closeDb();
  process.exit(0);
}

main().catch((err) => {
  console.error('[snapshot] Failed:', err);
  process.exit(1);
});
