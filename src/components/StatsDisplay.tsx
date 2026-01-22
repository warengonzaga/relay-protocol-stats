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
    <div className="w-full mx-auto space-y-4">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">Statistics</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Relay Protocol transaction data</p>
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            aria-label="Refresh statistics"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm">Refresh</span>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Total Transactions Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs">Total Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold">{stats.transactionCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Successful only</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Volume Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs">Total Volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold">
                ${stats.totalVolumeUsd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">USD transferred</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Chains Section */}
      {stats.topChains.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
          {/* Favorite Chain */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs">Favorite Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topChains[0].iconUrl}
                    alt={stats.topChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-medium text-center">
                    {stats.topChains[0].chainName}
                  </p>
                </>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">N/A</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Origin Chain */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs">Top Origin Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topOriginChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topOriginChains[0].iconUrl}
                    alt={stats.topOriginChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-medium text-center">
                    {stats.topOriginChains[0].chainName}
                  </p>
                </>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">N/A</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Destination Chain */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs">Top Destination Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topDestinationChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topDestinationChains[0].iconUrl}
                    alt={stats.topDestinationChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-medium text-center">
                    {stats.topDestinationChains[0].chainName}
                  </p>
                </>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">N/A</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {stats.transactionCount === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 sm:pt-5">
            <p className="text-xs sm:text-sm text-yellow-800">
              No successful transactions found for this wallet address.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
