/**
 * Forward-only Relay leaderboard sync script.
 *
 * Designed to run in GitHub Actions on a schedule (e.g., every 6 hours).
 * Fetches only NEW transactions from Relay's /requests/v2 endpoint since
 * the last sync timestamp, aggregates wallet volumes, and upserts to Supabase.
 *
 * On the very first run, it seeds the cursor with the current timestamp so
 * no historical data is ever fetched.
 *
 * Required env vars:
 *   SUPABASE_URL         – Supabase project URL
 *   SUPABASE_SERVICE_KEY  – Supabase service_role key (write access)
 *   RELAY_API_KEY         – (optional) Relay API key for higher rate limits
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ── Configuration ───────────────────────────────────────────────────

const RELAY_BASE_URL = 'https://api.relay.link';
const REQUESTS_PATH = '/requests/v2';
const PAGE_LIMIT = 50;
const DELAY_MS = 200;
const MAX_PAGES_PER_RUN = 500;
const MAX_CONSECUTIVE_EMPTY = 3;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2_000;

// ── Types ───────────────────────────────────────────────────────────

interface RelayRequestData {
  metadata?: {
    currencyIn?: {
      amountUsd?: string;
      amountUsdCurrent?: string;
    };
  };
}

interface RelayRequest {
  id: string;
  status: string;
  user?: string;
  createdAt?: string;
  data?: RelayRequestData;
}

interface RelayResponse {
  requests: RelayRequest[];
  continuation?: string;
}

interface WalletRow {
  wallet_address: string;
  total_volume_usd: number;
  total_tx: number;
}

interface SyncState {
  last_processed_timestamp: number;
  last_continuation: string | null;
}

// ── Helpers ─────────────────────────────────────────────────────────

function delay(ms: number = DELAY_MS): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getVolumeUsd(data?: RelayRequestData): number {
  if (!data) return 0;
  const meta = data.metadata?.currencyIn;
  if (meta?.amountUsd) {
    const v = parseFloat(meta.amountUsd);
    if (!Number.isNaN(v)) return v;
  }
  if (meta?.amountUsdCurrent) {
    const v = parseFloat(meta.amountUsdCurrent);
    if (!Number.isNaN(v)) return v;
  }
  return 0;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      console.warn(`  Retry ${attempt + 1}/${MAX_RETRIES}: ${lastErr.message}`);
      if (attempt < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }
  throw lastErr;
}

// ── Relay API ───────────────────────────────────────────────────────

const relayHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};
if (process.env.RELAY_API_KEY) {
  relayHeaders['x-relay-api-key'] = process.env.RELAY_API_KEY;
}

async function fetchPage(params: { continuation?: string; startTimestamp?: number }): Promise<{
  requests: RelayRequest[];
  continuation: string | null;
  maxCreatedAtMs: number;
}> {
  const url = new URL(`${RELAY_BASE_URL}${REQUESTS_PATH}`);
  url.searchParams.set('limit', String(PAGE_LIMIT));

  if (params.continuation) {
    url.searchParams.set('continuation', params.continuation);
  } else if (params.startTimestamp && params.startTimestamp > 0) {
    url.searchParams.set('startTimestamp', String(params.startTimestamp));
  }

  const res = await fetch(url.toString(), { headers: relayHeaders });
  if (!res.ok) {
    throw new Error(`Relay API returned status ${res.status}`);
  }

  const data = (await res.json()) as RelayResponse;
  const requests = data.requests ?? [];
  const continuation = data.continuation ?? null;

  let maxCreatedAtMs = 0;
  for (const r of requests) {
    if (r.createdAt) {
      const ms = new Date(r.createdAt).getTime();
      if (ms > maxCreatedAtMs) maxCreatedAtMs = ms;
    }
  }

  return { requests, continuation, maxCreatedAtMs };
}

// ── Aggregation ─────────────────────────────────────────────────────

function aggregatePage(requests: RelayRequest[]): WalletRow[] {
  const byWallet = new Map<string, WalletRow>();

  for (const req of requests) {
    if (req.status !== 'success') continue;
    const wallet = (req.user ?? '').trim().toLowerCase();
    if (!wallet) continue;

    const volumeUsd = getVolumeUsd(req.data);
    const existing = byWallet.get(wallet);

    if (!existing) {
      byWallet.set(wallet, {
        wallet_address: wallet,
        total_volume_usd: volumeUsd,
        total_tx: 1,
      });
    } else {
      existing.total_volume_usd += volumeUsd;
      existing.total_tx += 1;
    }
  }

  return Array.from(byWallet.values());
}

// ── Supabase operations ─────────────────────────────────────────────

async function getSyncState(supabase: SupabaseClient): Promise<SyncState> {
  const { data, error } = await supabase
    .from('sync_state')
    .select('last_processed_timestamp, last_continuation')
    .eq('id', 1)
    .single();

  if (error) throw new Error(`Failed to get sync state: ${error.message}`);
  return data as SyncState;
}

async function updateSyncContinuation(supabase: SupabaseClient, continuation: string | null): Promise<void> {
  const { error } = await supabase
    .from('sync_state')
    .update({
      last_continuation: continuation,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) throw new Error(`Failed to update continuation: ${error.message}`);
}

async function completeSyncRun(supabase: SupabaseClient, timestamp: number): Promise<void> {
  const { error } = await supabase
    .from('sync_state')
    .update({
      last_processed_timestamp: timestamp,
      last_continuation: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) throw new Error(`Failed to complete sync run: ${error.message}`);
}

async function upsertWallets(supabase: SupabaseClient, rows: WalletRow[]): Promise<void> {
  if (rows.length === 0) return;

  // Supabase upsert: on conflict, we need to increment existing values.
  // Since Supabase JS client doesn't support raw SQL increment on upsert,
  // we use the rpc approach with a database function, or fetch-then-update.
  // For simplicity and atomicity, we'll use a Postgres function via rpc.
  const { error } = await supabase.rpc('upsert_wallet_batch', {
    wallets: rows,
  });

  if (error) throw new Error(`Failed to upsert wallets: ${error.message}`);
}

// ── Seed first run ──────────────────────────────────────────────────

async function seedFirstRun(supabase: SupabaseClient): Promise<number> {
  const nowMs = Date.now();
  console.log(`[sync] First run detected. Seeding cursor to current timestamp: ${nowMs}`);
  await completeSyncRun(supabase, nowMs);
  return nowMs;
}

// ── Main sync loop ──────────────────────────────────────────────────

async function runSync(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let state = await withRetry(() => getSyncState(supabase));

  // First run: seed with current timestamp (forward-only)
  if (state.last_processed_timestamp === 0 && !state.last_continuation) {
    const ts = await seedFirstRun(supabase);
    state = { last_processed_timestamp: ts, last_continuation: null };
    console.log('[sync] Cursor seeded. Will collect transactions from this point forward.');
    return;
  }

  console.log(`[sync] Resuming from timestamp ${state.last_processed_timestamp}`);

  let pagesProcessed = 0;
  let requestsProcessed = 0;
  let walletsUpserted = 0;
  let continuation: string | null = state.last_continuation;
  let maxCreatedAtMs = 0;
  let consecutiveEmpty = 0;

  for (;;) {
    if (pagesProcessed >= MAX_PAGES_PER_RUN) {
      console.log(
        `[sync] Hit MAX_PAGES_PER_RUN (${MAX_PAGES_PER_RUN}), stopping. Next run will resume from saved continuation.`,
      );
      // Persist continuation so the next run resumes cleanly without re-processing
      await withRetry(() => updateSyncContinuation(supabase, continuation));
      return;
    }

    const page = await withRetry(() =>
      fetchPage({
        continuation: continuation ?? undefined,
        startTimestamp: !continuation ? state.last_processed_timestamp : undefined,
      }),
    );

    if (page.requests.length === 0) {
      consecutiveEmpty++;
      if (!page.continuation || consecutiveEmpty >= MAX_CONSECUTIVE_EMPTY) {
        console.log(`[sync] End of data (${consecutiveEmpty} empty page(s)).`);
        break;
      }
      continuation = page.continuation;
      pagesProcessed++;
      await delay();
      continue;
    }

    consecutiveEmpty = 0;
    requestsProcessed += page.requests.length;

    const batch = aggregatePage(page.requests);
    if (batch.length > 0) {
      await withRetry(() => upsertWallets(supabase, batch));
      walletsUpserted += batch.length;
    }

    if (page.maxCreatedAtMs > maxCreatedAtMs) {
      maxCreatedAtMs = page.maxCreatedAtMs;
    }

    pagesProcessed++;
    continuation = page.continuation;

    // Save continuation every 50 pages for crash recovery
    if (pagesProcessed % 50 === 0) {
      await withRetry(() => updateSyncContinuation(supabase, continuation));
    }

    if (pagesProcessed % 10 === 0) {
      console.log(`  Page ${pagesProcessed}: ${requestsProcessed} requests, ${walletsUpserted} wallet upserts`);
    }

    if (!page.continuation) break;
    await delay();
  }

  // Advance timestamp and clear continuation
  const newTs = maxCreatedAtMs > 0 ? maxCreatedAtMs : state.last_processed_timestamp;
  if (newTs > state.last_processed_timestamp) {
    await withRetry(() => completeSyncRun(supabase, newTs));
  } else {
    // No new data, just clear continuation
    await withRetry(() => updateSyncContinuation(supabase, null));
  }

  console.log(
    `[sync] Done. Pages: ${pagesProcessed}, Requests: ${requestsProcessed}, Wallets upserted: ${walletsUpserted}`,
  );
}

// ── Entry point ─────────────────────────────────────────────────────

runSync()
  .then(() => {
    console.log('[sync] Sync completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[sync] Sync failed:', err);
    process.exit(1);
  });
