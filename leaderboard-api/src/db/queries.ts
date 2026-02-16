import type { Pool } from 'pg';

// ── Sync state ──────────────────────────────────────────────────────

export async function getLastProcessedTimestamp(db: Pool): Promise<bigint> {
  const res = await db.query<{ last_processed_timestamp: string }>(
    'SELECT last_processed_timestamp FROM relay_sync_state WHERE id = 1'
  );
  if (res.rows.length === 0) {
    throw new Error('relay_sync_state row id=1 missing; run db:migrate');
  }
  return BigInt(res.rows[0].last_processed_timestamp);
}

export async function setLastProcessedTimestamp(db: Pool, ts: bigint): Promise<void> {
  await db.query(
    'UPDATE relay_sync_state SET last_processed_timestamp = $1, updated_at = now() WHERE id = 1',
    [ts.toString()]
  );
}

// ── Wallet volume upsert ────────────────────────────────────────────

export interface WalletUpsertRow {
  wallet_address: string;
  total_volume_usd: number;
  total_tx: number;
}

export async function upsertWalletsBatch(db: Pool, rows: WalletUpsertRow[]): Promise<void> {
  if (rows.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 0;
  for (const r of rows) {
    placeholders.push(`($${idx + 1}, $${idx + 2}::numeric, $${idx + 3})`);
    values.push(r.wallet_address, r.total_volume_usd, r.total_tx);
    idx += 3;
  }

  const sql = `
    INSERT INTO wallet_volume (wallet_address, total_volume_usd, total_tx)
    VALUES ${placeholders.join(', ')}
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_volume_usd = wallet_volume.total_volume_usd + EXCLUDED.total_volume_usd,
      total_tx = wallet_volume.total_tx + EXCLUDED.total_tx,
      last_updated = now()
  `;
  await db.query(sql, values);
}

// ── Snapshot: top 100k ──────────────────────────────────────────────

export async function refreshSnapshot(db: Pool): Promise<number> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS leaderboard_top_100k_staging');
    await client.query(`
      CREATE TABLE leaderboard_top_100k_staging (
        rank INTEGER NOT NULL,
        wallet_address TEXT PRIMARY KEY,
        total_volume_usd NUMERIC(24, 4) NOT NULL,
        total_tx INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const res = await client.query(`
      INSERT INTO leaderboard_top_100k_staging (rank, wallet_address, total_volume_usd, total_tx, updated_at)
      SELECT
        RANK() OVER (ORDER BY total_volume_usd DESC)::integer AS rank,
        wallet_address,
        total_volume_usd,
        total_tx,
        now()
      FROM wallet_volume
      ORDER BY total_volume_usd DESC
      LIMIT 100000
    `);

    await client.query('CREATE INDEX idx_staging_rank ON leaderboard_top_100k_staging (rank)');

    await client.query('DROP TABLE IF EXISTS leaderboard_top_100k_old');
    await client.query('ALTER TABLE leaderboard_top_100k RENAME TO leaderboard_top_100k_old');
    await client.query('ALTER TABLE leaderboard_top_100k_staging RENAME TO leaderboard_top_100k');
    await client.query('DROP TABLE IF EXISTS leaderboard_top_100k_old');

    await client.query('COMMIT');
    return res.rowCount ?? 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Leaderboard reads ───────────────────────────────────────────────

export interface LeaderboardRow {
  rank: number;
  wallet_address: string;
  total_volume_usd: string;
  total_tx: number;
  updated_at: Date;
}

export async function getLeaderboardPage(
  db: Pool,
  limit: number,
  offset: number
): Promise<LeaderboardRow[]> {
  const res = await db.query<LeaderboardRow>(
    'SELECT rank, wallet_address, total_volume_usd, total_tx, updated_at FROM leaderboard_top_100k ORDER BY rank LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return res.rows;
}

export async function getLeaderboardTotal(db: Pool): Promise<number> {
  const res = await db.query<{ count: string }>('SELECT count(*)::text AS count FROM leaderboard_top_100k');
  return parseInt(res.rows[0].count, 10);
}

export interface WalletRankRow {
  rank: number;
  wallet_address: string;
  total_volume_usd: string;
  total_tx: number;
}

export async function getWalletRank(db: Pool, wallet: string): Promise<WalletRankRow | null> {
  const normalized = wallet.trim().toLowerCase();
  const res = await db.query<WalletRankRow>(
    'SELECT rank, wallet_address, total_volume_usd, total_tx FROM leaderboard_top_100k WHERE wallet_address = $1',
    [normalized]
  );
  return res.rows[0] ?? null;
}
