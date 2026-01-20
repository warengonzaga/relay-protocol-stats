import { useState } from 'react';
import WalletInput from '@/components/WalletInput';
import StatsDisplay from '@/components/StatsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import RelayLogo from '@/components/RelayLogo';
import Footer from '@/components/Footer';
import { analyzeWalletStats } from '@/services/relayApi';
import type { WalletStats } from '@/types/relay';

function App() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedAddress, setAnalyzedAddress] = useState<string | null>(null);

  const handleAnalyze = async (address: string) => {
    setIsLoading(true);
    setError(null);
    setStats(null);

    try {
      const walletStats = await analyzeWalletStats(address);
      setStats(walletStats);
      setAnalyzedAddress(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAnalyzedAddress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStats(null);
    setError(null);
    setAnalyzedAddress(null);
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full">
        <header className="text-center mb-8 sm:mb-10 md:mb-12 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <RelayLogo className="h-12 sm:h-14 md:h-16" />
          </div>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Analyze your cross-chain transaction history
          </p>
        </header>

        <WalletInput
          onAnalyze={handleAnalyze}
          onReset={handleReset}
          isLoading={isLoading}
          analyzedAddress={analyzedAddress}
        />

        {isLoading && <LoadingSpinner />}

        {!isLoading && <StatsDisplay stats={stats} error={error} />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
