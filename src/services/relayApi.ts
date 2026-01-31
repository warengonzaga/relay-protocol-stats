import axios from 'axios';
import type {
  RelayResponse,
  RelayRequest,
  WalletStats,
  Chain,
  ChainStats,
  TokenStats,
  Currency,
  ChainVolume,
} from '../types/relay';

const BASE_URL = 'https://api.relay.link';
const REQUESTS_ENDPOINT = '/requests/v2';
const CHAINS_ENDPOINT = '/chains';
const CURRENCIES_ENDPOINT = '/currencies/v2';

/**
 * Fetch recent requests from Relay API for random wallet selection
 */
export async function fetchRecentRequests(limit: number = 6): Promise<RelayRequest[]> {
  try {
    const response = await axios.get<RelayResponse>(`${BASE_URL}${REQUESTS_ENDPOINT}`, {
      params: {
        limit: limit.toString(),
      },
    });

    return response.data.requests || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch recent transactions: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch all requests for a user address with automatic pagination
 */
export async function fetchAllUserRequests(userAddress: string): Promise<RelayRequest[]> {
  const allRequests: RelayRequest[] = [];
  let continuation: string | undefined = undefined;

  try {
    do {
      const params: Record<string, string> = {
        user: userAddress,
        limit: '50', // Maximum allowed by API
      };

      if (continuation) {
        params.continuation = continuation;
      }

      const response = await axios.get<RelayResponse>(`${BASE_URL}${REQUESTS_ENDPOINT}`, {
        params,
      });

      allRequests.push(...response.data.requests);
      continuation = response.data.continuation;

      // Add small delay between paginated requests to be respectful to API
      if (continuation) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (continuation);

    return allRequests;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch transactions: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Calculate total volume in USD from transaction data
 * Uses the metadata.currencyIn.amountUsd field which represents the actual transfer value
 */
function calculateVolumeUsd(request: RelayRequest): number {
  try {
    // The metadata field contains the actual transaction details
    const metadata = request.data.metadata;

    if (metadata?.currencyIn?.amountUsd) {
      const amountUsd = parseFloat(metadata.currencyIn.amountUsd);
      return isNaN(amountUsd) ? 0 : amountUsd;
    }

    // Fallback: try using amountUsdCurrent if available
    if (metadata?.currencyIn?.amountUsdCurrent) {
      const amountUsd = parseFloat(metadata.currencyIn.amountUsdCurrent);
      return isNaN(amountUsd) ? 0 : amountUsd;
    }

    return 0;
  } catch (error) {
    console.error('Error calculating volume:', error);
    return 0;
  }
}

/**
 * Calculate volume by source/origin chain (inTxs only; fallback to outTxs if no inTxs) in USD from successful requests.
 */
function calculateVolumeByChain(requests: RelayRequest[], chains: Chain[]): ChainVolume[] {
  const volumeByChainId = new Map<number, number>();

  requests.forEach(request => {
    const volumeUsd = calculateVolumeUsd(request);
    if (!volumeUsd) {
      return;
    }

    const chainIds = new Set<number>();

    const inTxs = request.data.inTxs ?? [];
    const outTxs = request.data.outTxs ?? [];

    if (inTxs.length > 0) {
      inTxs.forEach(tx => {
        if (typeof tx.chainId === 'number') {
          chainIds.add(tx.chainId);
        }
      });
    }

    if (chainIds.size === 0) {
      outTxs.forEach(tx => {
        if (typeof tx.chainId === 'number') {
          chainIds.add(tx.chainId);
        }
      });
    }

    if (chainIds.size === 0) {
      return;
    }

    chainIds.forEach(chainId => {
      volumeByChainId.set(chainId, (volumeByChainId.get(chainId) || 0) + volumeUsd);
    });
  });

  return Array.from(volumeByChainId.entries())
    .map(([chainId, volumeUsd]) => {
      const chain = chains.find(c => c.id === chainId);
      return {
        chainId,
        chainName: chain?.displayName || chain?.name || `Chain ${chainId}`,
        iconUrl: chain?.iconUrl || chain?.logoUrl,
        volumeUsd,
      };
    })
    .sort((a, b) => b.volumeUsd - a.volumeUsd);
}

/**
 * Fetch all chains from Relay API
 */
export async function fetchChains(): Promise<Chain[]> {
  try {
    const response = await axios.get(`${BASE_URL}${CHAINS_ENDPOINT}`);
    const data = response.data;

    // The API returns {chains: [...]} structure
    if (data && data.chains && Array.isArray(data.chains)) {
      return data.chains as Chain[];
    }

    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch chains: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch currencies/tokens from Relay API
 */
export async function fetchCurrencies(): Promise<Currency[]> {
  try {
    // The currencies endpoint is a POST request
    const response = await axios.post(`${BASE_URL}${CURRENCIES_ENDPOINT}`, {});
    const data = response.data;

    // The API returns an array of currencies
    if (data && Array.isArray(data)) {
      return data as Currency[];
    }

    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch currencies: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Calculate top chains statistics
 */
function calculateTopChains(
  requests: RelayRequest[],
  chains: Chain[],
  type: 'all' | 'origin' | 'destination'
): ChainStats[] {
  const chainCounts = new Map<number, number>();

  requests.forEach(request => {
    if (type === 'all' || type === 'origin') {
      request.data.inTxs.forEach(tx => {
        chainCounts.set(tx.chainId, (chainCounts.get(tx.chainId) || 0) + 1);
      });
    }
    if (type === 'all' || type === 'destination') {
      request.data.outTxs.forEach(tx => {
        chainCounts.set(tx.chainId, (chainCounts.get(tx.chainId) || 0) + 1);
      });
    }
  });

  // Convert to array and sort by count
  const chainStats: ChainStats[] = Array.from(chainCounts.entries())
    .map(([chainId, count]) => {
      // Find chain by matching the id property (which is the chainId)
      const chain = chains.find(c => c.id === chainId);
      return {
        chainId,
        chainName: chain?.displayName || chain?.name || `Chain ${chainId}`,
        iconUrl: chain?.iconUrl || chain?.logoUrl,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 chains

  return chainStats;
}

/**
 * Native token metadata by chain ID
 * Used as fallback when currency lookup fails
 */
const NATIVE_TOKEN_METADATA: Record<number, { symbol: string; logoUrl: string }> = {
  1: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  10: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  56: {
    symbol: 'BNB',
    logoUrl: 'https://assets.relay.link/icons/currencies/bnb.png'
  },
  137: {
    symbol: 'MATIC',
    logoUrl: 'https://assets.relay.link/icons/currencies/matic.png'
  },
  250: {
    symbol: 'FTM',
    logoUrl: 'https://assets.relay.link/icons/currencies/ftm.png'
  },
  8453: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  42161: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  43114: {
    symbol: 'AVAX',
    logoUrl: 'https://assets.relay.link/icons/currencies/avax.png'
  },
  7777777: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  59144: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  534352: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
  81457: {
    symbol: 'ETH',
    logoUrl: 'https://assets.relay.link/icons/currencies/eth.png'
  },
};

/**
 * Calculate top tokens statistics
 */
function calculateTopTokens(
  requests: RelayRequest[],
  chains: Chain[],
  currencies: Currency[],
  type: 'all' | 'origin' | 'destination'
): TokenStats[] {
  // Map to track token usage: key = "tokenAddress:chainId", value = count
  const tokenCounts = new Map<string, { address: string; chainId: number; count: number; symbol?: string }>();

  requests.forEach(request => {
    // Get token from currency field (this is the token contract address)
    let tokenAddress = request.data.currency;
    if (!tokenAddress || typeof tokenAddress !== 'string') {
      return; // Skip if no currency or invalid
    }
    
    // Normalize native token addresses
    // Native tokens like 'eth', 'bnb', 'matic' should be converted to zero address
    const isNativeToken = tokenAddress.toLowerCase() === 'eth' ||
        tokenAddress.toLowerCase() === 'bnb' ||
        tokenAddress.toLowerCase() === 'matic' ||
        tokenAddress.toLowerCase() === 'avax' ||
        tokenAddress.toLowerCase() === 'ftm' ||
        !tokenAddress.startsWith('0x');
    
    if (isNativeToken) {
      tokenAddress = '0x0000000000000000000000000000000000000000';
    }

    // Get token symbol - ensure it's always a string
    let tokenSymbol = 'Unknown';

    // Try to extract from amountFormatted (e.g., "1.5 USDC" -> "USDC")
    const amountFormatted = request.data.metadata?.currencyIn?.amountFormatted;
    if (amountFormatted && typeof amountFormatted === 'string') {
      const match = amountFormatted.match(/([A-Z]{2,10})$/i);
      if (match) {
        tokenSymbol = match[1].toUpperCase();
      }
    }

    // If still unknown, don't set a fallback yet - we'll handle it later with chain-specific logic
    // This prevents the "0X00...0000" issue

    if (type === 'all' || type === 'origin') {
      request.data.inTxs.forEach(tx => {
        const key = `${tokenAddress}:${tx.chainId}`;
        const existing = tokenCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          tokenCounts.set(key, {
            address: tokenAddress,
            chainId: tx.chainId,
            count: 1,
            symbol: tokenSymbol,
          });
        }
      });
    }

    if (type === 'all' || type === 'destination') {
      request.data.outTxs.forEach(tx => {
        const key = `${tokenAddress}:${tx.chainId}`;
        const existing = tokenCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          tokenCounts.set(key, {
            address: tokenAddress,
            chainId: tx.chainId,
            count: 1,
            symbol: tokenSymbol,
          });
        }
      });
    }
  });

  // Convert to array and sort by count
  const tokenStats: TokenStats[] = Array.from(tokenCounts.values())
    .map(token => {
      const chain = chains.find(c => c.id === token.chainId);

      // Check if this is a native token (zero address)
      const isNativeToken = token.address === '0x0000000000000000000000000000000000000000';

      // Find currency metadata for logo
      const currency = currencies.find(
        c => c.address.toLowerCase() === token.address.toLowerCase() && c.chainId === token.chainId
      );

      // Use symbol from currency metadata if available
      let finalSymbol = currency?.symbol || token.symbol || 'Unknown';

      // Get logo URL from currency metadata
      let logoUrl = currency?.logoURI || currency?.metadata?.logoURI;

      // Fallback for native tokens when currency data is missing
      if (isNativeToken && !currency) {
        const nativeMetadata = NATIVE_TOKEN_METADATA[token.chainId];
        if (nativeMetadata) {
          if (finalSymbol === 'Unknown') {
            finalSymbol = nativeMetadata.symbol;
          }
          logoUrl = nativeMetadata.logoUrl;
        }
      }

      // If symbol is still 'Unknown' and this is a native token, use ETH as default
      if (finalSymbol === 'Unknown' && isNativeToken) {
        finalSymbol = 'ETH';
      }

      // Last resort: if still unknown, use truncated address (only for non-native tokens)
      if (finalSymbol === 'Unknown' && !isNativeToken) {
        finalSymbol = `${token.address.slice(0, 4).toUpperCase()}...${token.address.slice(-4).toUpperCase()}`;
      }

      return {
        tokenAddress: token.address,
        tokenSymbol: finalSymbol,
        chainId: token.chainId,
        chainName: chain?.displayName || chain?.name || `Chain ${token.chainId}`,
        chainIconUrl: chain?.iconUrl || chain?.logoUrl,
        logoUrl,
        count: token.count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 tokens

  return tokenStats;
}

/**
 * Analyze wallet statistics
 */
export async function analyzeWalletStats(userAddress: string): Promise<WalletStats> {
  const [allRequests, chains, currencies] = await Promise.all([
    fetchAllUserRequests(userAddress),
    fetchChains(),
    fetchCurrencies(),
  ]);

  // Filter only successful transactions
  const successfulRequests = allRequests.filter(req => req.status === 'success');

  // Calculate transaction count
  const transactionCount = successfulRequests.length;
  const totalRequests = allRequests.length;
  // Count failed and refunded transactions separately
  const failedRequests = allRequests.filter(req => req.status === 'failure').length;
  const refundedRequests = allRequests.filter(req => req.status === 'refund').length;

  // Calculate success rate (percentage)
  const successRate = totalRequests > 0 ? (transactionCount / totalRequests) * 100 : 0;

  // Calculate total volume in USD
  const totalVolumeUsd = successfulRequests.reduce((total, request) => {
    return total + calculateVolumeUsd(request);
  }, 0);

  // Calculate volume by chain (source/origin)
  const volumeByChain = calculateVolumeByChain(successfulRequests, chains);

  // Calculate top chains
  const topChains = calculateTopChains(successfulRequests, chains, 'all');
  const topOriginChains = calculateTopChains(successfulRequests, chains, 'origin');
  const topDestinationChains = calculateTopChains(successfulRequests, chains, 'destination');

  // Calculate top tokens
  const topTokens = calculateTopTokens(successfulRequests, chains, currencies, 'all');
  const topOriginTokens = calculateTopTokens(successfulRequests, chains, currencies, 'origin');
  const topDestinationTokens = calculateTopTokens(successfulRequests, chains, currencies, 'destination');

  return {
    transactionCount,
    totalVolumeUsd,
    volumeByChain,
    topChains,
    topOriginChains,
    topDestinationChains,
    topTokens: topTokens || [],
    topOriginTokens: topOriginTokens || [],
    topDestinationTokens: topDestinationTokens || [],
    successRate,
    totalRequests,
    failedRequests,
    refundedRequests,
  };
}

/**
 * Validate wallet address format
 * Supports Ethereum (0x...) and Solana addresses
 */
export function isValidWalletAddress(address: string): boolean {
  // Ethereum address: 0x followed by 40 hex characters
  const isEthereum = /^0x[a-fA-F0-9]{40}$/.test(address);

  // Solana address: 32-44 base58 characters
  const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

  return isEthereum || isSolana;
}

// Backwards compatibility
export const isValidEthereumAddress = isValidWalletAddress;
