import WalletRow from './WalletRow';
import type { LeaderboardEntry } from '@/services/leaderboardApi';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading: boolean;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/60">
      <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-zinc-800 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" /></td>
      <td className="px-4 py-3 text-right"><div className="ml-auto h-4 w-20 rounded bg-zinc-800 animate-pulse" /></td>
      <td className="px-4 py-3 text-right"><div className="ml-auto h-4 w-12 rounded bg-zinc-800 animate-pulse" /></td>
    </tr>
  );
}

export default function LeaderboardTable({ entries, loading }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead className="border-b border-zinc-800 bg-zinc-900/95">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Wallet</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Volume (USD)</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
              : entries.map((entry) => <WalletRow key={entry.wallet_address} entry={entry} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
