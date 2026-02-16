const API_BASE = (import.meta.env.VITE_LEADERBOARD_API as string | undefined)?.replace(/\/$/, '') ?? '';

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

export async function fetchLeaderboardPage(page: number): Promise<LeaderboardPageResponse> {
  if (!API_BASE) {
    throw new Error('Leaderboard API not configured. Set VITE_LEADERBOARD_API in .env');
  }
  const res = await fetch(`${API_BASE}/leaderboard?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchWalletRank(wallet: string): Promise<WalletRankResponse> {
  if (!API_BASE) {
    throw new Error('Leaderboard API not configured');
  }
  const res = await fetch(`${API_BASE}/leaderboard/${encodeURIComponent(wallet.trim())}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
