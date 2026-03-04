-- Relay Leaderboard Schema (Supabase)
-- Forward-only: tracks wallets from deployment date onward

-- ── Wallet volume aggregation ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_volume (
  wallet_address TEXT PRIMARY KEY,
  total_volume_usd NUMERIC(24, 4) NOT NULL DEFAULT 0,
  total_tx INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_volume_desc
  ON wallet_volume (total_volume_usd DESC);

-- ── Sync cursor for incremental forward-only collection ─────────────
CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_processed_timestamp BIGINT NOT NULL DEFAULT 0,
  last_continuation TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Initialize with timestamp 0; the first sync run will set it to "now"
-- so only forward transactions are collected.
INSERT INTO sync_state (id, last_processed_timestamp)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- ── Row Level Security ──────────────────────────────────────────────
-- Allow anonymous (frontend) reads, block writes.

ALTER TABLE wallet_volume ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;

-- Public read access for wallet_volume
CREATE POLICY "Allow anonymous read on wallet_volume"
  ON wallet_volume FOR SELECT
  USING (true);

-- Only service_role can write to wallet_volume (GitHub Actions uses service key)
CREATE POLICY "Service role can insert/update wallet_volume"
  ON wallet_volume FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Only service_role can read/write sync_state
CREATE POLICY "Service role full access on sync_state"
  ON sync_state FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
