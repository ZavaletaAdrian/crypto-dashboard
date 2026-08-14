const COINBASE_BASE_URL = "https://api.coinbase.com/v2";
const FETCH_TIMEOUT_MS = 5000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Coinbase request failed: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as { data: T };
    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

export interface ExchangeRatesResponse {
  currency: string;
  rates: Record<string, string>;
}

/**
 * One call returns every currency's rate relative to 1 USD, including BTC —
 * enough to derive both USD and BTC pricing for every coin (see rate-cache.server.ts).
 */
export function fetchExchangeRates(): Promise<ExchangeRatesResponse> {
  return fetchJson<ExchangeRatesResponse>(`${COINBASE_BASE_URL}/exchange-rates?currency=USD`);
}

export interface CryptoCurrency {
  code: string;
  name: string;
}

export function fetchCryptoCurrencies(): Promise<CryptoCurrency[]> {
  return fetchJson<CryptoCurrency[]>(`${COINBASE_BASE_URL}/currencies/crypto`);
}
