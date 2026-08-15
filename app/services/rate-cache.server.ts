import { computeStalenessTier } from "~/utils/staleness";
import { TokenBucket } from "~/utils/tokenBucket";
import type { CoinRateMap, StalenessTier } from "~/types/coin";
import { fetchExchangeRates, type ExchangeRatesResponse } from "./coinbase.server";

export interface RateCacheOptions {
  fetchRates: () => Promise<ExchangeRatesResponse>;
  now?: () => number;
  capacity?: number;
  refillIntervalMs?: number;
  /** How old the cache may get before a read triggers a refresh attempt. */
  freshIntervalMs?: number;
  manualGuardMs?: number;
}

export interface RatesSnapshot {
  ratesByCode: CoinRateMap;
  fetchedAt: number | null;
  ageMs: number | null;
  tier: StalenessTier;
  lastError: string | null;
}

export interface ManualRefreshResult {
  ok: boolean;
  retryAfterMs?: number;
}

/**
 * Both USD and BTC pricing for every coin come from a single currency=USD
 * response: rates[code] is "units of code per 1 USD", so usd = 1/rates[code]
 * and btc = rates.BTC/rates[code] (a cross-rate through the shared USD base).
 * This is the fact the whole T1 budget design depends on — one Coinbase call
 * refreshes pricing for the entire coin list, not two.
 */
function toCoinRates(rawRates: Record<string, string>): CoinRateMap {
  const unitsPerUsdByCode: Record<string, number> = {};
  for (const [code, value] of Object.entries(rawRates)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      unitsPerUsdByCode[code] = parsed;
    }
  }
  const btcUnitsPerUsd = unitsPerUsdByCode.BTC;
  const result: CoinRateMap = {};
  for (const [code, unitsPerUsd] of Object.entries(unitsPerUsdByCode)) {
    result[code] = {
      usd: 1 / unitsPerUsd,
      btc: btcUnitsPerUsd ? btcUnitsPerUsd / unitsPerUsd : Number.NaN,
    };
  }
  return result;
}

export function createRateCache(options: RateCacheOptions) {
  const now = options.now ?? Date.now;
  const capacity = options.capacity ?? 10;
  const refillIntervalMs = options.refillIntervalMs ?? 6000;
  const freshIntervalMs = options.freshIntervalMs ?? 8000;
  const manualGuardMs = options.manualGuardMs ?? 2000;

  const bucket = new TokenBucket({ capacity, refillIntervalMs, now });

  let ratesByCode: CoinRateMap = {};
  let fetchedAt: number | null = null;
  let lastError: string | null = null;
  let inflight: Promise<boolean> | null = null;

  /** Resolves to whether the fetch actually succeeded, so callers waiting on
   *  an in-flight fetch (rather than starting their own) can tell success
   *  from failure instead of assuming success just because a call happened. */
  async function doFetch(): Promise<boolean> {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const data = await options.fetchRates();
        ratesByCode = toCoinRates(data.rates);
        fetchedAt = now();
        lastError = null;
        return true;
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Unknown error";
        return false;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  /**
   * Called on every read (the home route's loader and GET /api/rates) —
   * there is deliberately no background timer. This app deploys to Vercel,
   * where each request can run in a separate serverless invocation and the
   * JS event loop freezes between them: a self-rescheduling setTimeout loop
   * (the original design) simply stops ticking once the initiating
   * request's response is sent, and the cache gets stuck stale forever.
   * Checking freshness reactively on every read works regardless of
   * hosting model, and ties refresh cadence directly to actual client
   * polling (~2.5s) rather than an independent schedule that can drift out
   * of sync with real demand.
   */
  async function ensureFresh(): Promise<void> {
    const age = fetchedAt !== null ? now() - fetchedAt : Number.POSITIVE_INFINITY;
    if (age < freshIntervalMs) return;
    if (inflight) {
      await inflight;
      return;
    }
    if (bucket.tryConsume(now())) {
      await doFetch();
    }
    // No token available: proceed with the existing (possibly stale) cache
    // — the staleness tier in getSnapshot() communicates this to the UI.
  }

  function getSnapshot(): RatesSnapshot {
    const ageMs = fetchedAt !== null ? now() - fetchedAt : null;
    return {
      ratesByCode,
      fetchedAt,
      ageMs,
      tier: computeStalenessTier(ageMs),
      lastError,
    };
  }

  /**
   * Draws from the exact same bucket as ensureFresh — no separate manual
   * quota. If a fetch is already in flight, piggyback on it instead of
   * consuming a second token for a request that wouldn't trigger any new
   * Coinbase call anyway.
   */
  async function requestManualRefresh(): Promise<ManualRefreshResult> {
    const age = fetchedAt !== null ? now() - fetchedAt : Number.POSITIVE_INFINITY;
    if (age < manualGuardMs) return { ok: true };
    if (inflight) {
      const succeeded = await inflight;
      return { ok: succeeded };
    }
    if (bucket.tryConsume(now())) {
      const succeeded = await doFetch();
      return { ok: succeeded };
    }
    return { ok: false, retryAfterMs: bucket.msUntilNextToken(now()) };
  }

  function getDebugBudget() {
    return bucket.snapshot(now());
  }

  return {
    ensureFresh,
    getSnapshot,
    requestManualRefresh,
    getDebugBudget,
  };
}

export type RateCache = ReturnType<typeof createRateCache>;

declare global {
  var __rateCache: RateCache | undefined;
}

/**
 * Single in-memory instance per warm process/instance. On Vercel this means
 * per warm serverless instance, not globally — see the README's T1
 * limitation note on horizontal scaling.
 */
export const rateCache: RateCache =
  globalThis.__rateCache ?? (globalThis.__rateCache = createRateCache({ fetchRates: fetchExchangeRates }));
