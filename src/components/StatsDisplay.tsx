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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Transactions Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-sm">Total Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalRequests.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stats.transactionCount} successful</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Volume Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-sm">Total Volume</CardDescription>
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

        {/* Success Rate Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-sm">Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl sm:text-3xl font-bold">
                {Math.round(stats.successRate)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.transactionCount} success, {stats.failedRequests} failed, {stats.refundedRequests} refunded
              </p>
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
              <CardDescription className="text-sm">Favorite Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topChains[0].iconUrl}
                    alt={stats.topChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-normal text-center">
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
              <CardDescription className="text-sm">Top Origin Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topOriginChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topOriginChains[0].iconUrl}
                    alt={stats.topOriginChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-normal text-center">
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
              <CardDescription className="text-sm">Top Destination Chain</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topDestinationChains[0]?.iconUrl ? (
                <>
                  <img
                    src={stats.topDestinationChains[0].iconUrl}
                    alt={stats.topDestinationChains[0].chainName}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <p className="text-xs sm:text-sm font-normal text-center">
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

      {/* Top Tokens Section */}
      {stats.topTokens && stats.topTokens.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
          {/* Favorite Token */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-sm">Favorite Token</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topTokens[0]?.logoUrl ? (
                <>
                  <div className="relative">
                    <img
                      src={stats.topTokens[0].logoUrl}
                      alt={stats.topTokens[0].tokenSymbol}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                    />
                    {stats.topTokens[0].chainIconUrl && (
                      <img
                        src={stats.topTokens[0].chainIconUrl}
                        alt={stats.topTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topTokens[0].tokenAddress.slice(0, 4)}...{stats.topTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
                </>
              ) : stats.topTokens[0] ? (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {stats.topTokens[0].tokenSymbol?.slice(0, 3)}
                      </span>
                    </div>
                    {stats.topTokens[0].chainIconUrl && (
                      <img
                        src={stats.topTokens[0].chainIconUrl}
                        alt={stats.topTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topTokens[0].tokenAddress.slice(0, 4)}...{stats.topTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">N/A</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Origin Token */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-sm">Top Origin Token</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topOriginTokens[0]?.logoUrl ? (
                <>
                  <div className="relative">
                    <img
                      src={stats.topOriginTokens[0].logoUrl}
                      alt={stats.topOriginTokens[0].tokenSymbol}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                    />
                    {stats.topOriginTokens[0].chainIconUrl && (
                      <img
                        src={stats.topOriginTokens[0].chainIconUrl}
                        alt={stats.topOriginTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topOriginTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topOriginTokens[0].tokenAddress.slice(0, 4)}...{stats.topOriginTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
                </>
              ) : stats.topOriginTokens[0] ? (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {stats.topOriginTokens[0].tokenSymbol?.slice(0, 3)}
                      </span>
                    </div>
                    {stats.topOriginTokens[0].chainIconUrl && (
                      <img
                        src={stats.topOriginTokens[0].chainIconUrl}
                        alt={stats.topOriginTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topOriginTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topOriginTokens[0].tokenAddress.slice(0, 4)}...{stats.topOriginTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">N/A</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Destination Token */}
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-sm">Top Destination Token</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 space-y-2">
              {stats.topDestinationTokens[0]?.logoUrl ? (
                <>
                  <div className="relative">
                    <img
                      src={stats.topDestinationTokens[0].logoUrl}
                      alt={stats.topDestinationTokens[0].tokenSymbol}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                    />
                    {stats.topDestinationTokens[0].chainIconUrl && (
                      <img
                        src={stats.topDestinationTokens[0].chainIconUrl}
                        alt={stats.topDestinationTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topDestinationTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topDestinationTokens[0].tokenAddress.slice(0, 4)}...{stats.topDestinationTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
                </>
              ) : stats.topDestinationTokens[0] ? (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {stats.topDestinationTokens[0].tokenSymbol?.slice(0, 3)}
                      </span>
                    </div>
                    {stats.topDestinationTokens[0].chainIconUrl && (
                      <img
                        src={stats.topDestinationTokens[0].chainIconUrl}
                        alt={stats.topDestinationTokens[0].chainName}
                        className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 rounded-sm border-2 border-background"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-normal">
                      {stats.topDestinationTokens[0].tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.topDestinationTokens[0].tokenAddress.slice(0, 4)}...{stats.topDestinationTokens[0].tokenAddress.slice(-4)}
                    </p>
                  </div>
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
