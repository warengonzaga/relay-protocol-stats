-- Postgres function for atomic wallet volume upsert.
-- Called by the sync script via supabase.rpc('upsert_wallet_batch', { wallets: [...] })
-- This properly increments existing values instead of overwriting them.
--
-- SECURITY DEFINER: Runs with the owner's privileges, bypassing RLS.
-- This is intentional — the function is restricted to service_role only
-- via REVOKE/GRANT below, and service_role already bypasses RLS.

CREATE OR REPLACE FUNCTION upsert_wallet_batch(wallets JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  w JSONB;
BEGIN
  FOR w IN SELECT * FROM jsonb_array_elements(wallets)
  LOOP
    INSERT INTO wallet_volume (wallet_address, total_volume_usd, total_tx, last_updated)
    VALUES (
      w->>'wallet_address',
      (w->>'total_volume_usd')::NUMERIC(24,4),
      (w->>'total_tx')::INTEGER,
      now()
    )
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_volume_usd = wallet_volume.total_volume_usd + EXCLUDED.total_volume_usd,
      total_tx = wallet_volume.total_tx + EXCLUDED.total_tx,
      last_updated = now();
  END LOOP;
END;
$$;

-- Restrict upsert_wallet_batch to service_role only (sync script).
-- Prevents anon/authenticated frontend users from calling this function.
REVOKE EXECUTE ON FUNCTION upsert_wallet_batch(JSONB) FROM public;
REVOKE EXECUTE ON FUNCTION upsert_wallet_batch(JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION upsert_wallet_batch(JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION upsert_wallet_batch(JSONB) TO service_role;
