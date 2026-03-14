const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';
const PAGE_SIZE = 50;

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
  found: boolean;
  rank?: number;
  wallet_address: string;
  total_volume_usd?: number;
  total_tx?: number;
}

interface WalletVolumeRow {
  wallet_address: string;
  total_volume_usd: number | string;
  total_tx: number;
}

function requireSupabaseConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Leaderboard not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
}

function parseTotalCount(contentRange: string | null): number {
  if (!contentRange) return 0;
  const total = contentRange.split('/')[1];
  if (!total || total === '*') return 0;
  const parsed = Number(total);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function supabaseRequest(path: string, init?: RequestInit): Promise<Response> {
  requireSupabaseConfig();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Leaderboard request failed: HTTP ${res.status}`);
  }
  return res;
}

export async function fetchLeaderboardPage(page: number): Promise<LeaderboardPageResponse> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const params = new URLSearchParams({
    select: 'wallet_address,total_volume_usd,total_tx',
    order: 'total_volume_usd.desc,wallet_address.asc',
  });

  const res = await supabaseRequest(`wallet_volume?${params.toString()}`, {
    headers: {
      Prefer: 'count=exact',
      Range: `${from}-${to}`,
    },
  });

  const rows = (await res.json()) as WalletVolumeRow[];
  const totalWallets = parseTotalCount(res.headers.get('content-range'));
  const totalPages = Math.max(1, Math.ceil(totalWallets / PAGE_SIZE));

  return {
    data: rows.map((row, index) => ({
      rank: from + index + 1,
      wallet_address: row.wallet_address,
      total_volume_usd: Number(row.total_volume_usd) || 0,
      total_tx: row.total_tx,
    })),
    page: safePage,
    totalPages,
    totalWallets,
    pageSize: PAGE_SIZE,
  };
}

export async function fetchWalletRank(wallet: string): Promise<WalletRankResponse> {
  const normalizedWallet = wallet.trim().toLowerCase();
  if (!normalizedWallet) {
    throw new Error('Wallet is required');
  }

  const walletParams = new URLSearchParams({
    select: 'wallet_address,total_volume_usd,total_tx',
    wallet_address: `eq.${normalizedWallet}`,
    limit: '1',
  });

  const walletRes = await supabaseRequest(`wallet_volume?${walletParams.toString()}`);
  const rows = (await walletRes.json()) as WalletVolumeRow[];
  const walletRow = rows[0];

  if (!walletRow) {
    return {
      found: false,
      wallet_address: normalizedWallet,
    };
  }

  const volume = Number(walletRow.total_volume_usd) || 0;
  const countParams = new URLSearchParams({
    select: 'wallet_address',
    total_volume_usd: `gt.${volume}`,
  });

  const countRes = await supabaseRequest(`wallet_volume?${countParams.toString()}`, {
    method: 'HEAD',
    headers: {
      Prefer: 'count=exact',
      Range: '0-0',
    },
  });
  const greaterCount = parseTotalCount(countRes.headers.get('content-range'));

  return {
    found: true,
    rank: greaterCount + 1,
    wallet_address: walletRow.wallet_address,
    total_volume_usd: volume,
    total_tx: walletRow.total_tx,
  };
}
