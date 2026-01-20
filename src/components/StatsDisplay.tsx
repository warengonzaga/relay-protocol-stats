import type { WalletStats } from '@/types/relay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface StatsDisplayProps {
  stats: WalletStats | null;
  error: string | null;
}

export default function StatsDisplay({ stats, error }: StatsDisplayProps) {
  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Address Statistics</CardTitle>
          <CardDescription>Relay Protocol transaction history for this address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-4xl font-bold">{stats.transactionCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Successful transactions only</p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-4xl font-bold">
              ${stats.totalVolumeUsd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground">USD value of transferred tokens</p>
          </div>
        </CardContent>
      </Card>

      {stats.transactionCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">
              No successful transactions found for this wallet address.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
