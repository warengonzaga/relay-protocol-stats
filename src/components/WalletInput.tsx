import { useState, useEffect } from 'react';
import { isValidEthereumAddress, fetchRecentRequests } from '@/services/relayApi';
import { resolveENSToAddress } from '@/services/ens';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Check, Share2, Eye, EyeOff, Sparkles, X } from 'lucide-react';
import Avatar from 'boring-avatars';

interface WalletInputProps {
  onAnalyze: (address: string) => void;
  onReset: () => void;
  isLoading: boolean;
  analyzedAddress: string | null;
  ensName: string | null;
}

export default function WalletInput({ onAnalyze, onReset, isLoading, analyzedAddress, ensName }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  // Show tooltip after 15 seconds if user hasn't analyzed a wallet yet and hasn't dismissed it
  useEffect(() => {
    if (!analyzedAddress && !tooltipDismissed) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [analyzedAddress, tooltipDismissed]);

  // Auto-dismiss tooltip after 1 minute of being shown
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
        setTooltipDismissed(true);
      }, 60000); // 1 minute

      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter a wallet address or ENS name');
      return;
    }

    const trimmedAddress = address.trim();

    // Check if it's an ENS name (.eth)
    if (trimmedAddress.endsWith('.eth')) {
      try {
        const resolvedAddress = await resolveENSToAddress(trimmedAddress);
        if (resolvedAddress) {
          onAnalyze(resolvedAddress);
        } else {
          setError('Unable to resolve ENS name. Please check the name and try again.');
        }
      } catch (err) {
        setError('Failed to resolve ENS name. Please try again.');
      }
      return;
    }

    // Validate as regular address
    if (!isValidEthereumAddress(trimmedAddress)) {
      setError('Invalid format. Please enter a valid wallet address or ENS name (.eth)');
      return;
    }

    onAnalyze(trimmedAddress);
  };

  const handleReset = () => {
    setAddress('');
    setError('');
    setCopied(false);
    setShared(false);
    onReset();
  };

  const handleRandomWallet = async () => {
    setError('');
    setIsLoadingRandom(true);
    
    try {
      // Fetch 6 recent transactions
      const recentRequests = await fetchRecentRequests(6);
      
      if (recentRequests.length === 0) {
        setError('No recent transactions found');
        setIsLoadingRandom(false);
        return;
      }
      
      // Randomly pick one transaction
      const randomIndex = Math.floor(Math.random() * recentRequests.length);
      const randomRequest = recentRequests[randomIndex];
      
      // Get the user address from the transaction
      const randomAddress = randomRequest.user;
      
      if (randomAddress && isValidEthereumAddress(randomAddress)) {
        onAnalyze(randomAddress);
      } else {
        setError('Invalid wallet address from transaction');
      }
    } catch (err) {
      setError('Failed to fetch random wallet. Please try again.');
      console.error('Random wallet error:', err);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  const handleCopy = async () => {
    if (analyzedAddress) {
      try {
        await navigator.clipboard.writeText(analyzedAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleExternalLink = () => {
    if (analyzedAddress) {
      window.open(`https://relay.link/transactions?address=${analyzedAddress}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    if (analyzedAddress) {
      try {
        const shareUrl = `${window.location.origin}${window.location.pathname}?wallet=${analyzedAddress}`;
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const truncateAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const toggleAddressVisibility = () => {
    setIsAddressVisible(!isAddressVisible);
  };

  // Show compact loading view while analyzing - hide entire input form
  if (isLoading) {
    return (
      <div className="w-full mx-auto mb-6">
        {/* Compact Loading Header with scale-in animation */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border rounded-lg p-4 sm:p-6 animate-in zoom-in-95 fade-in duration-300">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar Skeleton */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-muted animate-pulse">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
            </div>

            {/* Wallet Info Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 sm:h-5 bg-muted rounded animate-pulse w-48 max-w-full" />
              <div className="h-3 sm:h-4 bg-muted/50 rounded animate-pulse w-64 max-w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show analyzed address view after successful analysis
  if (analyzedAddress && !isLoading) {
    // Determine if address is Solana (not starting with 0x)
    const isSolana = !analyzedAddress.startsWith('0x');

    // Determine the profile title
    let profileTitle = 'Wallet Address Profile';
    if (ensName) {
      profileTitle = ensName;
    } else if (!isSolana) {
      // For Ethereum addresses without ENS, show "Wallet Address Profile"
      profileTitle = 'Wallet Address Profile';
    }

    return (
      <div className="w-full mx-auto mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border rounded-lg p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
              <Avatar
                size={64}
                name={analyzedAddress}
                variant="pixel"
                colors={['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)', 'hsl(var(--primary) / 0.2)']}
              />
            </div>

            {/* Wallet Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold mb-1">{profileTitle}</h2>
              <div className="flex items-center gap-2">
                <a
                  href={`https://blockscan.com/address/${analyzedAddress}?utm_source=relay-protocol-stats&utm_medium=web&utm_campaign=wallet-analysis`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors break-all underline decoration-dotted underline-offset-2"
                >
                  {isAddressVisible ? analyzedAddress : truncateAddress(analyzedAddress)}
                </a>
                <button
                  onClick={toggleAddressVisibility}
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={isAddressVisible ? 'Hide address' : 'Show address'}
                >
                  {isAddressVisible ? (
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={`transition-colors ${copied ? 'border-green-500 bg-green-50' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 text-green-600" />
                  <span className="text-xs sm:text-sm">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="text-xs sm:text-sm">Copy</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className={`transition-colors ${shared ? 'border-green-500 bg-green-50' : ''}`}
            >
              {shared ? (
                <>
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 text-green-600" />
                  <span className="text-xs sm:text-sm">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                  <span className="text-xs sm:text-sm">Share</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalLink}
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              <span className="text-xs sm:text-sm">View on Relay</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleReset}
              className="ml-auto"
            >
              <span className="text-xs sm:text-sm">Analyze Another</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show input form
  return (
    <div className="relative group w-full mx-auto">
      {/* Flowing purple light effect - travels around perimeter on hover */}
      <div className="absolute -inset-[2px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 overflow-hidden" style={{ borderRadius: 'calc(var(--radius) + 2px)' }}>
        <div className="absolute inset-[-100%] animate-border-spin-bg" />
      </div>

      <Card className="relative w-full border border-border/50 shadow-2xl bg-card transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] group-focus-within:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
        <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Analyze Wallet
          </CardTitle>
        </div>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Discover your cross-chain journey with Relay Protocol. Enter any wallet address or ENS name to unlock detailed transaction insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="text-xs sm:text-sm font-semibold text-foreground/90 flex items-center gap-2">
              Wallet Address or ENS Name
              <span className="text-xs font-normal text-muted-foreground">(.eth supported)</span>
            </label>
            <div className="relative">
              <Input
                id="wallet-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="vitalik.eth or 0x..."
                disabled={isLoading}
                className="font-mono text-xs sm:text-sm h-11 sm:h-12 bg-background/50 border-2 focus:border-primary transition-colors pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRandomWallet}
                disabled={isLoading || isLoadingRandom}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 hover:bg-primary/10 z-10"
                title="Analyze random wallet"
              >
                {isLoadingRandom ? (
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
              </Button>
              {showTooltip && !analyzedAddress && (
                <div className="absolute right-0 top-full mt-0.5 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative bg-card border-2 border-primary text-foreground rounded-lg shadow-xl p-3 pr-8 w-[200px] sm:w-[240px]">
                    <button
                      onClick={() => {
                        setShowTooltip(false);
                        setTooltipDismissed(true);
                      }}
                      className="absolute right-2 top-2 hover:opacity-70 transition-opacity"
                      aria-label="Close tooltip"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      💡 Click the sparkle icon to analyze a random wallet!
                    </p>
                    <div className="absolute -top-2 right-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-primary" />
                  </div>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs sm:text-sm text-destructive leading-relaxed">{error}</p>
              </div>
            )}
          </div>
          {address.trim() && (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-sm sm:text-base h-11 sm:h-12 font-semibold shadow-lg hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analyze Transaction History
                </span>
              )}
            </Button>
          )}
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
