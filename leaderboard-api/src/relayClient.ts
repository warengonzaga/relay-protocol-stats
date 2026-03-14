import axios, { type AxiosInstance } from 'axios';

const BASE_URL = 'https://api.relay.link';
const REQUESTS_PATH = '/requests/v2';
const PAGE_LIMIT = 50;
const DELAY_MS = 150;

export interface RelayRequestData {
  price?: string;
  currency?: string;
  metadata?: {
    currencyIn?: {
      amountUsd?: string;
      amountUsdCurrent?: string;
      amount?: string;
    };
  };
}

export interface RelayRequest {
  id: string;
  status: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: RelayRequestData;
}

export interface RelayResponse {
  requests: RelayRequest[];
  continuation?: string;
}

export interface FetchPageResult {
  requests: RelayRequest[];
  continuation: string | null;
  maxCreatedAtMs: number;
}

function createClient(): AxiosInstance {
  const apiKey = process.env.RELAY_API_KEY;
  return axios.create({
    baseURL: BASE_URL,
    timeout: 60_000,
    headers: apiKey ? { 'x-relay-api-key': apiKey } : {},
  });
}

let client: AxiosInstance | null = null;
function getClient(): AxiosInstance {
  if (!client) client = createClient();
  return client;
}

export async function fetchRequestsPage(params: {
  continuation?: string;
  startTimestamp?: bigint;
}): Promise<FetchPageResult> {
  const c = getClient();
  const query: Record<string, string> = { limit: String(PAGE_LIMIT) };
  if (params.continuation) {
    query.continuation = params.continuation;
  } else if (params.startTimestamp !== undefined && params.startTimestamp > 0n) {
    query.startTimestamp = params.startTimestamp.toString();
  }

  const res = await c.get<RelayResponse>(REQUESTS_PATH, { params: query });
  const requests = res.data.requests ?? [];
  const continuation = res.data.continuation ?? null;

  let maxCreatedAtMs = 0;
  for (const r of requests) {
    if (r.createdAt) {
      const ms = new Date(r.createdAt).getTime();
      if (ms > maxCreatedAtMs) maxCreatedAtMs = ms;
    }
  }

  return { requests, continuation, maxCreatedAtMs };
}

export function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, DELAY_MS));
}

/**
 * Extract USD volume from a single request.
 */
export function getVolumeUsd(data?: RelayRequestData): number {
  if (!data) return 0;
  const meta = data.metadata?.currencyIn;
  if (meta?.amountUsd) {
    const v = parseFloat(meta.amountUsd);
    if (!isNaN(v)) return v;
  }
  if (meta?.amountUsdCurrent) {
    const v = parseFloat(meta.amountUsdCurrent);
    if (!isNaN(v)) return v;
  }
  return 0;
}
