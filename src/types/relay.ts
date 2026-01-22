// Transaction status types
export type TransactionStatus = 'success' | 'pending' | 'failure' | 'refund' | 'waiting';

// Fee structure in wei
export interface Fees {
  gas: string;
  fixed: string;
  price: string;
}

// Fee structure in USD
export interface FeesUsd {
  gas: string;
  fixed: string;
  price: string;
}

// Individual transaction (inTx or outTx)
export interface Transaction {
  fee: string;
  data: string;
  hash: string;
  type: string;
  chainId: number;
  timestamp: number;
}

// Currency amount metadata
export interface CurrencyAmount {
  amountUsd?: string;
  amountUsdCurrent?: string;
  amount?: string;
  amountFormatted?: string;
  [key: string]: any;
}

// Request metadata
export interface RequestMetadata {
  currencyIn?: CurrencyAmount;
  [key: string]: any;
}

// Request data
export interface RequestData {
  subsidizedRequest: boolean;
  fees: Fees;
  feesUsd: FeesUsd;
  inTxs: Transaction[];
  outTxs: Transaction[];
  currency: string;
  price: string;
  usesExternalLiquidity: boolean;
  metadata?: RequestMetadata;
}

// Individual relay request
export interface RelayRequest {
  id: string;
  status: TransactionStatus;
  user: string;
  recipient: string;
  data: RequestData;
  moonpayId?: string;
  createdAt: string;
  updatedAt: string;
}

// API response
export interface RelayResponse {
  requests: RelayRequest[];
  continuation?: string;
}

// Chain information from /chains endpoint
export interface Chain {
  id: number;
  name: string;
  displayName: string;
  httpRpcUrl?: string;
  wsRpcUrl?: string;
  explorerUrl?: string;
  explorerName?: string;
  explorerPaths?: {
    transaction?: string;
    address?: string;
  };
  depositEnabled?: boolean;
  tokenSupport?: string;
  disabled?: boolean;
  partialDisableLimit?: number;
  iconUrl?: string;
  logoUrl?: string;
  brandColor?: string;
  contracts?: Record<string, unknown>;
  vmType?: string;
}

// Chain statistics
export interface ChainStats {
  chainId: number;
  chainName: string;
  iconUrl?: string;
  count: number;
}

// Aggregated wallet statistics
export interface WalletStats {
  transactionCount: number;
  totalVolumeUsd: number;
  topChains: ChainStats[];
  topOriginChains: ChainStats[];
  topDestinationChains: ChainStats[];
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  refundedRequests: number;
}
