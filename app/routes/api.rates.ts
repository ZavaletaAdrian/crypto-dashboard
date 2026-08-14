import type { Route } from "./+types/api.rates";
import { rateCache } from "~/services/rate-cache.server";
import { getCoinCatalog } from "~/services/coin-catalog.server";

async function buildPayload() {
  const snapshot = rateCache.getSnapshot();
  const coins = await getCoinCatalog();
  return {
    coins,
    rates: snapshot.ratesByCode,
    fetchedAt: snapshot.fetchedAt,
    ageMs: snapshot.ageMs,
    tier: snapshot.tier,
    budget: rateCache.getDebugBudget(),
  };
}

/** GET: cheap cache read. Clients (any number of tabs) poll this freely — it never calls Coinbase. */
export async function loader({}: Route.LoaderArgs) {
  rateCache.markPolled();
  await rateCache.ensureBootstrap();
  return buildPayload();
}

/** POST: manual refresh — draws from the exact same token bucket as the background loop (T1). */
export async function action({}: Route.ActionArgs) {
  rateCache.markPolled();
  const result = await rateCache.requestManualRefresh();
  return { ...(await buildPayload()), refreshOk: result.ok, retryAfterMs: result.retryAfterMs ?? null };
}
