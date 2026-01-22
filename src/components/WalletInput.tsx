import { useState } from 'react';
import { isValidEthereumAddress } from '@/services/relayApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Check, Share2, Eye, EyeOff } from 'lucide-react';

interface WalletInputProps {
  onAnalyze: (address: string) => void;
  onReset: () => void;
  isLoading: boolean;
  analyzedAddress: string | null;
}

export default function WalletInput({ onAnalyze, onReset, isLoading, analyzedAddress }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isAddressVisible, setIsAddressVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidEthereumAddress(address.trim())) {
      setError('Invalid wallet address format. Please enter a valid Ethereum (0x...) or Solana address.');
      return;
    }

    onAnalyze(address.trim());
  };

  const handleReset = () => {
    setAddress('');
    setError('');
    setCopied(false);
    setShared(false);
    onReset();
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

  // Show analyzed address view after successful analysis
  if (analyzedAddress && !isLoading) {
    return (
      <div className="w-full mx-auto mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border rounded-lg p-4 sm:p-6 mb-4">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl font-bold text-primary-foreground">
                {analyzedAddress.slice(2, 4).toUpperCase()}
              </span>
            </div>

            {/* Wallet Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold mb-1">Wallet Profile</h2>
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
    <Card className="w-full mx-auto">
      <CardHeader className="space-y-1 sm:space-y-2">
        <CardTitle className="text-lg sm:text-xl md:text-2xl">Analyze Wallet</CardTitle>
        <CardDescription className="text-sm sm:text-base">Enter any wallet address to view Relay Protocol transaction statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="text-xs sm:text-sm font-medium">
              Wallet Address
            </label>
            <Input
              id="wallet-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address (Ethereum, Solana, etc.)"
              disabled={isLoading}
              className="font-mono text-xs sm:text-sm"
            />
            {error && (
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full text-sm sm:text-base"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
