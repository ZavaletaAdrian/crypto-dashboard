import { rateCache } from "./rate-cache.server";
import { getCoinCatalog } from "./coin-catalog.server";
import type { RatesPayload } from "~/types/rates";

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
 * For reads (page load, client polling): triggers a refresh attempt if the
 * cache is stale enough (including a cold, never-fetched cache) — see
 * rate-cache.server.ts's ensureFresh for why this is reactive rather than a
 * background timer.
 */
export async function getRatesPayloadForRead(): Promise<RatesPayload> {
  await rateCache.ensureFresh();
  return buildPayload();
}

/**
 * For the manual-refresh action only. Deliberately does NOT call
 * ensureFresh — requestManualRefresh() is already this request's one fetch
 * attempt, and calling ensureFresh afterward would let a failed refresh
 * silently consume a second token from the same click.
 */
export async function getRatesPayloadAfterManualRefresh(): Promise<RatesPayload> {
  return buildPayload();
}
