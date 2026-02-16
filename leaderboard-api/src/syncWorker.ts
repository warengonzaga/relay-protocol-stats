/**
 * Incremental sync: page-by-page from Relay API, aggregate per page, bulk upsert.
 * Memory-efficient: never holds the full dataset.
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
}

export async function runSync(): Promise<SyncResult> {
  const db = getDb();
  const lastTs = await withRetry(() => getLastProcessedTimestamp(db));

  let pagesProcessed = 0;
  let requestsProcessed = 0;
  let walletsUpserted = 0;
  let continuation: string | null = null;
  let maxCreatedAtMs = 0;

  for (;;) {
    const page = await withRetry(() =>
      fetchRequestsPage({
        continuation: continuation ?? undefined,
        startTimestamp: lastTs > 0n ? lastTs : undefined,
      })
    );

    if (page.requests.length === 0 && !page.continuation) break;

    requestsProcessed += page.requests.length;
    if (page.maxCreatedAtMs > maxCreatedAtMs) maxCreatedAtMs = page.maxCreatedAtMs;

    const batch = aggregatePage(page.requests);
    if (batch.length > 0) {
      await withRetry(() => upsertWalletsBatch(db, batch));
      walletsUpserted += batch.length;
    }

    pagesProcessed++;
    console.log(`  Page ${pagesProcessed}: ${requestsProcessed} requests, ${walletsUpserted} wallet upserts`);

    if (!page.continuation) break;
    continuation = page.continuation;
    await delay();
  }

  const newTs = maxCreatedAtMs > 0 ? BigInt(maxCreatedAtMs) : lastTs;
  if (newTs > lastTs) {
    await withRetry(() => setLastProcessedTimestamp(db, newTs));
  }

  return { pagesProcessed, requestsProcessed, walletsUpserted, lastTimestamp: newTs };
}
