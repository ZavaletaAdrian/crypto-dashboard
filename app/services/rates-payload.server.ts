import { rateCache } from "./rate-cache.server";
import { getCoinCatalog } from "./coin-catalog.server";
import type { Coin, CoinRate, StalenessTier } from "~/types/coin";

export interface RatesPayload {
  coins: Coin[];
  rates: Record<string, CoinRate>;
  fetchedAt: number | null;
  ageMs: number | null;
  tier: StalenessTier;
  lastError: string | null;
  budget: { tokensAvailable: number; capacity: number };
}

async function buildPayload(): Promise<RatesPayload> {
  const snapshot = rateCache.getSnapshot();
  const coins = await getCoinCatalog();
  return {
    coins,
    rates: snapshot.ratesByCode,
    fetchedAt: snapshot.fetchedAt,
    ageMs: snapshot.ageMs,
    tier: snapshot.tier,
    lastError: snapshot.lastError,
    budget: rateCache.getDebugBudget(),
  };
}

/**
 * For reads (page load, client polling): triggers the cold-start bootstrap
 * fetch if the cache has never been populated.
 */
export async function getRatesPayloadForRead(): Promise<RatesPayload> {
  rateCache.markPolled();
  await rateCache.ensureBootstrap();
  return buildPayload();
}

/**
 * For the manual-refresh action only. Deliberately does NOT call
 * ensureBootstrap — requestManualRefresh() is already this request's one
 * fetch attempt, and calling ensureBootstrap afterward would let a failed
 * cold-start refresh silently consume a second token from the same click.
 */
export async function getRatesPayloadAfterManualRefresh(): Promise<RatesPayload> {
  rateCache.markPolled();
  return buildPayload();
}
