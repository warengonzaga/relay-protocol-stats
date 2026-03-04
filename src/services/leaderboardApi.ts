import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  rank: number;
  wallet_address: string;
  total_volume_usd: number;
  total_tx: number;
}

export interface LeaderboardPageResponse {
  data: LeaderboardEntry[];
  page: number;
  totalPages: number;
  totalWallets: number;
  pageSize: number;
}

export interface WalletRankResponse {
  inTop100k: boolean;
  rank?: number;
  wallet_address: string;
  total_volume_usd?: number;
  total_tx?: number;
}

const PAGE_SIZE = 50;

/**
 * Fetch a page of the leaderboard directly from Supabase.
 * Reads from wallet_volume ordered by total_volume_usd DESC.
 */
export async function fetchLeaderboardPage(page: number): Promise<LeaderboardPageResponse> {
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * PAGE_SIZE;

  // Get total count
  const { count, error: countError } = await supabase.from('wallet_volume').select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to fetch leaderboard count: ${countError.message}`);
  }

  const totalWallets = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalWallets / PAGE_SIZE));

  // Get page data ordered by volume descending
  const { data, error } = await supabase
    .from('wallet_volume')
    .select('wallet_address, total_volume_usd, total_tx')
    .order('total_volume_usd', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  const entries: LeaderboardEntry[] = (data ?? []).map((row, i) => ({
    rank: offset + i + 1,
    wallet_address: row.wallet_address,
    total_volume_usd: parseFloat(String(row.total_volume_usd)),
    total_tx: row.total_tx,
  }));

  return {
    data: entries,
    page: safePage,
    totalPages,
    totalWallets,
    pageSize: PAGE_SIZE,
  };
}

/**
 * Look up a specific wallet's rank and stats.
 * Uses a count query to determine rank position.
 */
export async function fetchWalletRank(wallet: string): Promise<WalletRankResponse> {
  const normalized = wallet.trim().toLowerCase();

  // Get the wallet's stats
  const { data, error } = await supabase
    .from('wallet_volume')
    .select('wallet_address, total_volume_usd, total_tx')
    .eq('wallet_address', normalized)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to look up wallet: ${error.message}`);
  }

  if (!data) {
    return { inTop100k: false, wallet_address: normalized };
  }

  const volumeUsd = parseFloat(String(data.total_volume_usd));

  // Count how many wallets have higher volume to determine rank
  const { count, error: rankError } = await supabase
    .from('wallet_volume')
    .select('*', { count: 'exact', head: true })
    .gt('total_volume_usd', data.total_volume_usd);

  if (rankError) {
    throw new Error(`Failed to compute rank: ${rankError.message}`);
  }

  const rank = (count ?? 0) + 1;

  return {
    inTop100k: true,
    rank,
    wallet_address: data.wallet_address,
    total_volume_usd: volumeUsd,
    total_tx: data.total_tx,
  };
}
