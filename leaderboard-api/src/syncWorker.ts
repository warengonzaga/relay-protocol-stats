/**
 * Incremental sync: page-by-page from Relay API, aggregate per page, bulk upsert.
 * Memory-efficient: never holds the full dataset.
 *
 * Safety features:
 *  - Per-page atomic transaction (upsert + timestamp advance in one commit)
 *  - Consecutive-empty-page guard to prevent infinite loops
 *  - MAX_PAGES_PER_RUN cap so cron runs stay bounded
 */
import { fetchRequestsPage, delay, getVolumeUsd, type RelayRequest } from './relayClient.js';
import { getDb } from './db/client.js';
import {
  getLastProcessedTimestamp,
  setLastProcessedTimestamp,
  upsertWalletsBatch,
  type WalletUpsertRow,
} from './db/queries.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;
const MAX_PAGES_PER_RUN = 5_000;
const MAX_CONSECUTIVE_EMPTY_PAGES = 3;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      console.warn(`Retry ${attempt + 1}/${MAX_RETRIES}: ${lastErr.message}`);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

function aggregatePage(requests: RelayRequest[]): WalletUpsertRow[] {
  const byWallet = new Map<string, WalletUpsertRow>();

  for (const req of requests) {
    if (req.status !== 'success') continue;
    const wallet = (req.user ?? '').trim().toLowerCase();
    if (!wallet) continue;

    const volumeUsd = getVolumeUsd(req.data);

    const existing = byWallet.get(wallet);
    if (!existing) {
      byWallet.set(wallet, { wallet_address: wallet, total_volume_usd: volumeUsd, total_tx: 1 });
    } else {
      existing.total_volume_usd += volumeUsd;
      existing.total_tx += 1;
    }
  }

  return Array.from(byWallet.values());
}

export interface SyncResult {
  pagesProcessed: number;
  requestsProcessed: number;
  walletsUpserted: number;
  lastTimestamp: bigint;
  stoppedEarly: boolean;
}

export async function runSync(): Promise<SyncResult> {
  const db = getDb();
  const lastTs = await withRetry(() => getLastProcessedTimestamp(db));

  let pagesProcessed = 0;
  let requestsProcessed = 0;
  let walletsUpserted = 0;
  let continuation: string | null = null;
  let consecutiveEmptyPages = 0;
  let stoppedEarly = false;

  for (;;) {
    if (pagesProcessed >= MAX_PAGES_PER_RUN) {
      console.log(`[sync] Hit MAX_PAGES_PER_RUN (${MAX_PAGES_PER_RUN}), stopping early. Next cron run will resume.`);
      stoppedEarly = true;
      break;
    }

    const page = await withRetry(() =>
      fetchRequestsPage({
        continuation: continuation ?? undefined,
        startTimestamp: lastTs > 0n ? lastTs : undefined,
      })
    );

    if (page.requests.length === 0) {
      consecutiveEmptyPages++;
      if (!page.continuation || consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY_PAGES) {
        console.log(`[sync] End of data (${consecutiveEmptyPages} consecutive empty page(s), continuation=${!!page.continuation}).`);
        break;
      }
      continuation = page.continuation;
      pagesProcessed++;
      await delay();
      continue;
    }

    consecutiveEmptyPages = 0;
    requestsProcessed += page.requests.length;
    const pageMaxTs = page.maxCreatedAtMs > 0 ? BigInt(page.maxCreatedAtMs) : 0n;

    const batch = aggregatePage(page.requests);

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      if (batch.length > 0) {
        const values: unknown[] = [];
        const placeholders: string[] = [];
        let idx = 0;
        for (const r of batch) {
          placeholders.push(`($${idx + 1}, $${idx + 2}::numeric, $${idx + 3})`);
          values.push(r.wallet_address, r.total_volume_usd, r.total_tx);
          idx += 3;
        }
        await client.query(
          `INSERT INTO wallet_volume (wallet_address, total_volume_usd, total_tx)
           VALUES ${placeholders.join(', ')}
           ON CONFLICT (wallet_address) DO UPDATE SET
             total_volume_usd = wallet_volume.total_volume_usd + EXCLUDED.total_volume_usd,
             total_tx = wallet_volume.total_tx + EXCLUDED.total_tx,
             last_updated = now()`,
          values
        );
        walletsUpserted += batch.length;
      }

      if (pageMaxTs > 0n) {
        await client.query(
          'UPDATE relay_sync_state SET last_processed_timestamp = $1, updated_at = now() WHERE id = 1',
          [pageMaxTs.toString()]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    pagesProcessed++;
    console.log(`  Page ${pagesProcessed}: ${requestsProcessed} requests, ${walletsUpserted} wallet upserts`);

    if (!page.continuation) break;
    continuation = page.continuation;
    await delay();
  }

  return { pagesProcessed, requestsProcessed, walletsUpserted, lastTimestamp: lastTs, stoppedEarly };
}
