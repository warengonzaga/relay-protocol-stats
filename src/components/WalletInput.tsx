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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Analyzed Wallet</CardTitle>
          <CardDescription>Relay Protocol transaction statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Wallet Address
            </label>
            <p className="font-mono text-sm bg-muted p-3 rounded-md break-all">
              {analyzedAddress}
            </p>
          </div>
          <Button
            onClick={handleReset}
            className="w-full"
          >
            Analyze Another Wallet Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show input form
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analyze Wallet</CardTitle>
        <CardDescription>Enter any wallet address to view Relay Protocol transaction statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="wallet-address" className="text-sm font-medium">
              Wallet Address
            </label>
            <Input
              id="wallet-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address (Ethereum, Solana, etc.)"
              disabled={isLoading}
              className="font-mono"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
