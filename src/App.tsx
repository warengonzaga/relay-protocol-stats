import { useState, useRef, useEffect } from 'react';
import WalletInput from '@/components/WalletInput';
import StatsDisplay from '@/components/StatsDisplay';
import LoadingSpinner from '@/components/LoadingSpinner';
import RelayLogo from '@/components/RelayLogo';
import Footer from '@/components/Footer';
import { analyzeWalletStats, isValidEthereumAddress } from '@/services/relayApi';
import { resolveENS } from '@/services/ens';
import type { WalletStats } from '@/types/relay';

function App() {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedAddress, setAnalyzedAddress] = useState<string | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState<string>('');
  const currentRequestIdRef = useRef(0);

  // Read wallet address from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const walletParam = urlParams.get('wallet');

    if (walletParam && isValidEthereumAddress(walletParam)) {
      handleAnalyze(walletParam);
    }
  }, []);

  const handleAnalyze = async (address: string) => {
    setIsLoading(true);
    setLoadingAddress(address);
    setError(null);
    setStats(null);
    setEnsName(null);

    try {
      // Resolve ENS name in parallel with wallet stats
      const [walletStats, resolvedEns] = await Promise.all([
        analyzeWalletStats(address),
        resolveENS(address),
      ]);

      setStats(walletStats);
      setAnalyzedAddress(address);
      setEnsName(resolvedEns);

      // Update URL with wallet parameter
      const url = new URL(window.location.href);
      url.searchParams.set('wallet', address);
      window.history.pushState({}, '', url.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAnalyzedAddress(null);
      setEnsName(null);
    } finally {
      setIsLoading(false);
      setLoadingAddress('');
    }
  };

  const handleReset = () => {
    setStats(null);
    setError(null);
    setAnalyzedAddress(null);
    setEnsName(null);
    setLoadingAddress('');

    // Clear wallet parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('wallet');
    window.history.pushState({}, '', url.toString());
  };

  const handleRefresh = async () => {
    if (!analyzedAddress || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    // Increment request ID and capture it for this request
    currentRequestIdRef.current += 1;
    const requestId = currentRequestIdRef.current;

    try {
      const walletStats = await analyzeWalletStats(analyzedAddress);

      // Only update if this is still the latest request
      if (requestId === currentRequestIdRef.current) {
        setStats(walletStats);
      }
    } catch (err) {
      // Only update error if this is still the latest request
      if (requestId === currentRequestIdRef.current) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      // Only clear refreshing state if this is still the latest request
      if (requestId === currentRequestIdRef.current) {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 flex flex-col">
      <div className="max-w-3xl mx-auto flex-1 w-full">
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
          ensName={ensName}
        />

        {isLoading && <LoadingSpinner address={loadingAddress} />}

        {!isLoading && <StatsDisplay stats={stats} error={error} onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
