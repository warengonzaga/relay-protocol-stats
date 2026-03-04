/**
 * Hourly snapshot: TRUNCATE + INSERT top 100k from wallet_volume into leaderboard_top_100k.
 */
import { getDb } from './db/client.js';
import { refreshSnapshot } from './db/queries.js';

export async function runSnapshot(): Promise<number> {
  const db = getDb();
  const count = await refreshSnapshot(db);
  return count;
}
