import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import RelayLogo from '@/components/RelayLogo';
import StatsDisplay from '@/components/StatsDisplay';
import type { WalletStats } from '@/types/relay';

const DEMO_STATS: WalletStats = {
  transactionCount: 248,
  totalVolumeUsd: 18432.76,
  dailyVolumeByRange: {
    '7D': [
      { date: '2026-10-06', volumeUsd: 420 },
      { date: '2026-10-07', volumeUsd: 810 },
      { date: '2026-10-08', volumeUsd: 625 },
      { date: '2026-10-09', volumeUsd: 1140 },
      { date: '2026-10-10', volumeUsd: 730 },
      { date: '2026-10-11', volumeUsd: 980 },
      { date: '2026-10-12', volumeUsd: 560 },
    ],
    '30D': [],
    '1Y': [],
  },
  volumeByChain: [
    { chainId: 1, chainName: 'Ethereum', volumeUsd: 8200 },
    { chainId: 8453, chainName: 'Base', volumeUsd: 6150 },
    { chainId: 42161, chainName: 'Arbitrum', volumeUsd: 4082.76 },
  ],
  topChains: [{ chainId: 1, chainName: 'Ethereum', count: 180 }],
  topOriginChains: [{ chainId: 1, chainName: 'Ethereum', count: 112 }],
  topDestinationChains: [{ chainId: 8453, chainName: 'Base', count: 96 }],
  topTokens: [
    {
      tokenAddress: '0x0000000000000000000000000000000000000000',
      tokenSymbol: 'ETH',
      chainId: 1,
      chainName: 'Ethereum',
      count: 94,
    },
  ],
  topOriginTokens: [],
  topDestinationTokens: [],
  successRate: 97.6,
  totalRequests: 254,
  failedRequests: 6,
  refundedRequests: 0,
};

export default function App() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 flex flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1">
        <header className="mb-8 space-y-3 text-center sm:mb-10">
          <div className="flex justify-center">
            <RelayLogo className="h-10 sm:h-12 md:h-14" />
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">Sample wallet analytics</p>
          <Link to="/leaderboard" className="inline-block text-sm font-medium text-primary hover:underline">
            Sample Global Leaderboard →
          </Link>
        </header>

        <aside className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
          Demo data only. This preserved dashboard no longer fetches wallet, Relay API, ENS, or live leaderboard data.
        </aside>

        <StatsDisplay stats={DEMO_STATS} error={null} />
      </main>
      <Footer />
    </div>
  );
}
