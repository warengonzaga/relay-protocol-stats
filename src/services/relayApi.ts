import axios from 'axios';
import type { RelayResponse, RelayRequest, WalletStats } from '../types/relay';

const BASE_URL = 'https://api.relay.link';
const REQUESTS_ENDPOINT = '/requests/v2';

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
 * Analyze wallet statistics
 */
export async function analyzeWalletStats(userAddress: string): Promise<WalletStats> {
  const allRequests = await fetchAllUserRequests(userAddress);

  // Filter only successful transactions
  const successfulRequests = allRequests.filter(req => req.status === 'success');

  // Calculate transaction count
  const transactionCount = successfulRequests.length;

  // Calculate total volume in USD
  const totalVolumeUsd = successfulRequests.reduce((total, request) => {
    return total + calculateVolumeUsd(request);
  }, 0);

  return {
    transactionCount,
    totalVolumeUsd,
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
