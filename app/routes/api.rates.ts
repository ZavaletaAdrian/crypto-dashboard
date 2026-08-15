import type { Route } from "./+types/api.rates";
import { rateCache } from "~/services/rate-cache.server";
import { getRatesPayloadAfterManualRefresh, getRatesPayloadForRead } from "~/services/rates-payload.server";

/**
 * GET: cheap cache read for any number of client tabs to poll freely.
 * Coinbase is only actually called when ensureFresh (inside
 * getRatesPayloadForRead) decides the cache has aged past its threshold —
 * otherwise this is a pure in-memory read with no upstream call.
 */
export async function loader({}: Route.LoaderArgs) {
  return getRatesPayloadForRead();
}

/** POST: manual refresh — draws from the exact same token bucket as ensureFresh (T1). */
export async function action({}: Route.ActionArgs) {
  const result = await rateCache.requestManualRefresh();
  const payload = await getRatesPayloadAfterManualRefresh();
  return { ...payload, refreshOk: result.ok, retryAfterMs: result.retryAfterMs ?? null };
}
