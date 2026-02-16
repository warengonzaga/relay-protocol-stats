-- Relay All-Time Leaderboard Schema
-- Run: pnpm run db:migrate

-- Master aggregation table: every wallet that ever used Relay
CREATE TABLE IF NOT EXISTS wallet_volume (
  wallet_address TEXT PRIMARY KEY,
  total_volume_usd NUMERIC(24, 4) NOT NULL DEFAULT 0,
  total_tx INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_volume_desc
  ON wallet_volume (total_volume_usd DESC);

-- Hourly snapshot: precomputed top 100k with dense ranks
CREATE TABLE IF NOT EXISTS leaderboard_top_100k (
  rank INTEGER NOT NULL,
  wallet_address TEXT PRIMARY KEY,
  total_volume_usd NUMERIC(24, 4) NOT NULL,
  total_tx INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
  ON leaderboard_top_100k (rank);

-- Sync cursor for incremental backfill
CREATE TABLE IF NOT EXISTS relay_sync_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_processed_timestamp BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO relay_sync_state (id, last_processed_timestamp)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
