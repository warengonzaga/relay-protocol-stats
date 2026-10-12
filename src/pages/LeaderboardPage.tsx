import { Link } from 'react-router-dom';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

const DEMO_ENTRIES = [
  { rank: 1, wallet_address: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', total_volume_usd: 125430, total_tx: 842 },
  { rank: 2, wallet_address: '0x3f4a8b12d0e571c2900b9c4612f8a7316d4e5c20', total_volume_usd: 98765, total_tx: 613 },
  { rank: 3, wallet_address: '0x9a2e4d7c1b6f8035a1c9e2d4f7b0a6385c1d9e42', total_volume_usd: 76420, total_tx: 507 },
  { rank: 4, wallet_address: '0x5c8d1e3f7a9b2046c1d8e5f2a7b90364d1e8c5f0', total_volume_usd: 52310, total_tx: 389 },
  { rank: 5, wallet_address: '0x2d6f9a1c4e7b8035d2f6a9c1e4b7d0835f2a6c91', total_volume_usd: 41875, total_tx: 296 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <Link to="/stats" className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          ← Back to sample stats
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
            Sample Global Relay Leaderboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Illustrative entries only. This preserved page no longer connects to Supabase or searches live wallets.
          </p>
        </header>

        <LeaderboardTable entries={DEMO_ENTRIES} loading={false} />
      </div>
    </main>
  );
}
