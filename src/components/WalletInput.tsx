import { useState } from 'react';
import { isValidEthereumAddress } from '@/services/relayApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Check } from 'lucide-react';

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

  // Show analyzed address view after successful analysis
  if (analyzedAddress && !isLoading) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="space-y-1 sm:space-y-2 relative">
          <Button
            variant="outline"
            size="icon"
            onClick={handleExternalLink}
            className="absolute top-4 right-4 h-8 w-8 sm:h-9 sm:w-9"
            title="View on Relay"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg sm:text-xl md:text-2xl pr-12">Analyzed Wallet</CardTitle>
          <CardDescription className="text-sm sm:text-base">Relay Protocol transaction statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground">
              Wallet Address
            </label>
            <div className="flex gap-2">
              <p className="font-mono text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded-md break-all flex-1">
                {analyzedAddress}
              </p>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={`h-auto w-10 sm:w-11 flex-shrink-0 transition-colors ${copied ? 'border-green-500 bg-green-50' : ''}`}
                title={copied ? 'Copied!' : 'Copy address'}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            onClick={handleReset}
            className="w-full text-sm sm:text-base"
          >
            Analyze Another Wallet Address
          </Button>
        </CardContent>
      </Card>
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
