import { useState } from 'react';
import { isValidEthereumAddress } from '@/services/relayApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WalletInputProps {
  onAnalyze: (address: string) => void;
  onReset: () => void;
  isLoading: boolean;
  analyzedAddress: string | null;
}

export default function WalletInput({ onAnalyze, onReset, isLoading, analyzedAddress }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

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
    onReset();
  };

  // Show analyzed address view after successful analysis
  if (analyzedAddress && !isLoading) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Analyzed Wallet</CardTitle>
          <CardDescription className="text-sm sm:text-base">Relay Protocol transaction statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground">
              Wallet Address
            </label>
            <p className="font-mono text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded-md break-all">
              {analyzedAddress}
            </p>
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
