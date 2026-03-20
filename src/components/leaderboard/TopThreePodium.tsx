import { Crown, Medal, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LeaderboardEntry } from '@/services/leaderboardApi';
import { formatUsd, shortenAddress } from '@/lib/leaderboard';

interface TopThreePodiumProps {
  first: LeaderboardEntry;
  second: LeaderboardEntry;
  third: LeaderboardEntry;
}

interface PodiumCardProps {
  entry: LeaderboardEntry;
  place: 'first' | 'second' | 'third';
}

function PodiumCard({ entry, place }: PodiumCardProps) {
  const config = {
    first: {
      icon: Crown,
      iconClass: 'text-yellow-300',
      rankClass: 'text-yellow-200',
      cardClass: 'border-yellow-400/30 bg-zinc-900/90',
      offsetClass: 'mt-0',
    },
    second: {
      icon: Medal,
      iconClass: 'text-zinc-300',
      rankClass: 'text-zinc-200',
      cardClass: 'border-zinc-400/30 bg-zinc-900/85',
      offsetClass: 'mt-8',
    },
    third: {
      icon: Award,
      iconClass: 'text-amber-400',
      rankClass: 'text-amber-300',
      cardClass: 'border-amber-700/40 bg-zinc-900/80',
      offsetClass: 'mt-12',
    },
  }[place];

  const Icon = config.icon;

  return (
    <div className={`w-full ${config.offsetClass}`}>
      <div className={`rounded-2xl border p-4 ${config.cardClass}`}>
        <div className="mb-3 flex items-center justify-between">
          <span className={`text-lg font-bold ${config.rankClass}`}>#{entry.rank}</span>
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        <Link
          to={`/?wallet=${encodeURIComponent(entry.wallet_address)}`}
          className="font-mono text-sm text-zinc-100 underline-offset-2 transition-colors hover:text-primary hover:underline"
          title="Open wallet analytics"
        >
          {shortenAddress(entry.wallet_address)}
        </Link>
        <p className="mt-2 text-sm font-semibold text-zinc-200">{formatUsd(entry.total_volume_usd)}</p>
        <p className="text-xs text-zinc-500">{entry.total_tx.toLocaleString()} transactions</p>
      </div>
    </div>
  );
}

export default function TopThreePodium({ first, second, third }: TopThreePodiumProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500">Top 3 wallets</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
        <PodiumCard entry={second} place="second" />
        <PodiumCard entry={first} place="first" />
        <PodiumCard entry={third} place="third" />
      </div>
    </div>
  );
}
