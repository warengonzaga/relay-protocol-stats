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
  hasNextPage: boolean;
  totalCountAvailable: boolean;
  totalCountIsEstimated: boolean;
}

export interface WalletRankResponse {
  inLeaderboard: boolean;
  rank?: number;
  rankIsEstimated?: boolean;
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

  // Fetch one extra row to detect whether another page exists even if total counts are unavailable.
  const { data, error } = await supabase
    .from('wallet_volume')
    .select('wallet_address, total_volume_usd, total_tx')
    .order('total_volume_usd', { ascending: false })
    .range(offset, offset + PAGE_SIZE);

  if (error) {
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  const pageRows = data ?? [];
  const hasNextPage = pageRows.length > PAGE_SIZE;
  const visibleRows = hasNextPage ? pageRows.slice(0, PAGE_SIZE) : pageRows;
  let lowerBoundTotalWallets = 0;

  if (hasNextPage) {
    lowerBoundTotalWallets = offset + PAGE_SIZE + 1;
  } else if (visibleRows.length > 0) {
    lowerBoundTotalWallets = offset + visibleRows.length;
  }

  // When Supabase cannot return a total count, fall back to the rows we know about.
  // If another page exists this is a lower bound; otherwise it is the exact total.
  let totalWallets = lowerBoundTotalWallets;
  let totalPages = Math.max(1, safePage + (hasNextPage ? 1 : 0));
  let totalCountAvailable = false;
  let totalCountIsEstimated = false;

  const { count: exactCount, error: exactCountError } = await supabase
    .from('wallet_volume')
    .select('wallet_address', { count: 'exact', head: true });

  if (!exactCountError && typeof exactCount === 'number') {
    totalWallets = exactCount;
    totalPages = Math.max(1, Math.ceil(totalWallets / PAGE_SIZE));
    totalCountAvailable = true;
  } else {
    const { count: plannedCount, error: plannedCountError } = await supabase
      .from('wallet_volume')
      .select('wallet_address', { count: 'planned', head: true });

    if (!plannedCountError && typeof plannedCount === 'number') {
      // Planned counts are estimates, so keep at least the lower bound implied by the loaded page.
      totalWallets = Math.max(plannedCount, lowerBoundTotalWallets);
      totalPages = Math.max(1, Math.ceil(totalWallets / PAGE_SIZE));
      totalCountIsEstimated = true;
    }
  }

  const entries: LeaderboardEntry[] = visibleRows.map((row, i) => ({
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
    hasNextPage,
    totalCountAvailable,
    totalCountIsEstimated,
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
    return { inLeaderboard: false, wallet_address: normalized };
  }

  const volumeUsd = parseFloat(String(data.total_volume_usd));

  const { count: exactRankCount, error: exactRankError } = await supabase
    .from('wallet_volume')
    .select('wallet_address', { count: 'exact', head: true })
    .gt('total_volume_usd', data.total_volume_usd);

  if (!exactRankError && typeof exactRankCount === 'number') {
    return {
      inLeaderboard: true,
      rank: exactRankCount + 1,
      rankIsEstimated: false,
      wallet_address: data.wallet_address,
      total_volume_usd: volumeUsd,
      total_tx: data.total_tx,
    };
  }

  // Count how many wallets have higher volume to determine rank.
  const { count: plannedRankCount, error: plannedRankError } = await supabase
    .from('wallet_volume')
    .select('wallet_address', { count: 'planned', head: true })
    .gt('total_volume_usd', data.total_volume_usd);

  return {
    inLeaderboard: true,
    rank: !plannedRankError && typeof plannedRankCount === 'number' ? plannedRankCount + 1 : undefined,
    rankIsEstimated: !plannedRankError && typeof plannedRankCount === 'number',
    wallet_address: data.wallet_address,
    total_volume_usd: volumeUsd,
    total_tx: data.total_tx,
  };
}
