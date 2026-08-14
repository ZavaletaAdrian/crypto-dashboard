import type { Route } from "./+types/api.rates";
import { rateCache } from "~/services/rate-cache.server";
import { getRatesPayloadAfterManualRefresh, getRatesPayloadForRead } from "~/services/rates-payload.server";

/** GET: cheap cache read. Clients (any number of tabs) poll this freely — it never calls Coinbase directly. */
export async function loader({}: Route.LoaderArgs) {
  return getRatesPayloadForRead();
}

/** POST: manual refresh — draws from the exact same token bucket as the background loop (T1). */
export async function action({}: Route.ActionArgs) {
  const result = await rateCache.requestManualRefresh();
  const payload = await getRatesPayloadAfterManualRefresh();
  return { ...payload, refreshOk: result.ok, retryAfterMs: result.retryAfterMs ?? null };
}
