import type { WalletStats } from '@/types/relay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StatsDisplayProps {
  stats: WalletStats | null;
  error: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function StatsDisplay({ stats, error, onRefresh, isRefreshing = false }: StatsDisplayProps) {
  if (error) {
    return (
      <Card className="w-full mx-auto mt-6 sm:mt-8 border-destructive">
        <CardHeader className="space-y-1 sm:space-y-2">
          <CardTitle className="flex items-center gap-2 text-destructive text-lg sm:text-xl">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="w-full mx-auto mt-6 sm:mt-8 space-y-4">
      <Card>
        <CardHeader className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Wallet Address Statistics</CardTitle>
              <CardDescription className="text-sm sm:text-base mt-1 sm:mt-2">Relay Protocol transaction history for this address</CardDescription>
            </div>
            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="icon"
                className="ml-2 flex-shrink-0"
                aria-label="Refresh statistics"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.transactionCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Successful transactions only</p>
          </div>

          <div className="border-t pt-3 sm:pt-4 space-y-1 sm:space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
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
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-xs sm:text-sm text-yellow-800">
              No successful transactions found for this wallet address.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
