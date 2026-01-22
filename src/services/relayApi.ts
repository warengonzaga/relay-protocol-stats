import axios from 'axios';
import type { RelayResponse, RelayRequest, WalletStats, Chain, ChainStats } from '../types/relay';

const BASE_URL = 'https://api.relay.link';
const REQUESTS_ENDPOINT = '/requests/v2';
const CHAINS_ENDPOINT = '/chains';

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
 * Analyze wallet statistics
 */
export async function analyzeWalletStats(userAddress: string): Promise<WalletStats> {
  const [allRequests, chains] = await Promise.all([
    fetchAllUserRequests(userAddress),
    fetchChains(),
  ]);

  // Filter only successful transactions
  const successfulRequests = allRequests.filter(req => req.status === 'success');

  // Calculate transaction count
  const transactionCount = successfulRequests.length;
  const totalRequests = allRequests.length;
  const failedRequests = allRequests.filter(req => req.status === 'failure').length;

  // Calculate success rate (percentage)
  const successRate = totalRequests > 0 ? (transactionCount / totalRequests) * 100 : 0;

  // Calculate total volume in USD
  const totalVolumeUsd = successfulRequests.reduce((total, request) => {
    return total + calculateVolumeUsd(request);
  }, 0);

  // Calculate top chains
  const topChains = calculateTopChains(successfulRequests, chains, 'all');
  const topOriginChains = calculateTopChains(successfulRequests, chains, 'origin');
  const topDestinationChains = calculateTopChains(successfulRequests, chains, 'destination');

  return {
    transactionCount,
    totalVolumeUsd,
    topChains,
    topOriginChains,
    topDestinationChains,
    successRate,
    totalRequests,
    failedRequests,
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
