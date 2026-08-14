import type { Coin, CoinRate, StalenessTier } from "./coin";

/**
 * Wire shape shared between the server (rates-payload.server.ts) and the
 * client (useRatesPolling). Kept out of any `*.server.ts` module so client
 * code never imports from a server-only file, even as a type-only import.
 */
export interface RatesPayload {
  coins: Coin[];
  rates: Record<string, CoinRate>;
  fetchedAt: number | null;
  ageMs: number | null;
  tier: StalenessTier;
  lastError: string | null;
  budget: { tokensAvailable: number; capacity: number };
}
