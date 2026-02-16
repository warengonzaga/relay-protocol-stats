import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import PaginationControls from '@/components/leaderboard/PaginationControls';
import { Button } from '@/components/ui/button';
import { fetchLeaderboardPage, fetchWalletRank, type LeaderboardEntry, type WalletRankResponse } from '@/services/leaderboardApi';
import { formatUsd, shortenAddress } from '@/lib/leaderboard';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWallets, setTotalWallets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // wallet search
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<WalletRankResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLeaderboardPage(p);
      setEntries(res.data);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotalWallets(res.totalWallets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leaderboard');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const wallet = searchValue.trim();
    if (!wallet) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError(null);
    try {
      const result = await fetchWalletRank(wallet);
      setSearchResult(result);
    } catch {
      setSearchError('Could not look up wallet');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {/* Back link */}
        <Link to="/" className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Back to stats
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
              Global Relay Leaderboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Top {totalWallets.toLocaleString()} wallets ranked by all-time volume &middot; Updated hourly
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Wallet address..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                disabled={searching}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <Button type="submit" size="sm" disabled={searching || !searchValue.trim()}>
              Search
            </Button>
          </form>
        </div>

        {/* Search result banner */}
        {searchResult && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Wallet lookup</p>
                <p className="font-mono text-sm text-zinc-200">{shortenAddress(searchResult.wallet_address)}</p>
              </div>
              {searchResult.inTop100k ? (
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">#{searchResult.rank}</p>
                  <p className="text-sm text-zinc-400">{formatUsd(searchResult.total_volume_usd ?? 0)}</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Not in top 100k</p>
              )}
              <button
                type="button"
                onClick={() => setSearchResult(null)}
                className="ml-4 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {searchError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
            {searchError}
            <button type="button" onClick={() => setSearchError(null)} className="ml-3 text-zinc-500 hover:text-zinc-300">Dismiss</button>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => loadPage(page)}
              className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {(!error || loading) && (
          <>
            <LeaderboardTable entries={entries} loading={loading} />
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={() => loadPage(page - 1)}
              onNext={() => loadPage(page + 1)}
              disabled={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}
