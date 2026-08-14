import { computeStalenessTier } from "~/utils/staleness";
import { TokenBucket } from "~/utils/tokenBucket";
import type { CoinRateMap, StalenessTier } from "~/types/coin";
import { fetchExchangeRates, type ExchangeRatesResponse } from "./coinbase.server";

export interface RateCacheOptions {
  fetchRates: () => Promise<ExchangeRatesResponse>;
  now?: () => number;
  capacity?: number;
  refillIntervalMs?: number;
  backgroundIntervalMs?: number;
  idleTimeoutMs?: number;
  manualGuardMs?: number;
  /** Set false in tests to drive the loop manually via the returned `_tick`. */
  autoStart?: boolean;
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
  const backgroundIntervalMs = options.backgroundIntervalMs ?? 8000;
  const idleTimeoutMs = options.idleTimeoutMs ?? 30_000;
  const manualGuardMs = options.manualGuardMs ?? 2000;

  const bucket = new TokenBucket({ capacity, refillIntervalMs, now });

  let ratesByCode: CoinRateMap = {};
  let fetchedAt: number | null = null;
  let consecutiveFailures = 0;
  let lastError: string | null = null;
  let lastPolledAt = now();
  let inflight: Promise<boolean> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

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
        consecutiveFailures = 0;
        lastError = null;
        return true;
      } catch (err) {
        consecutiveFailures += 1;
        lastError = err instanceof Error ? err.message : "Unknown error";
        return false;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  function backoffMs(): number {
    if (consecutiveFailures === 0) return backgroundIntervalMs;
    return Math.min(60_000, backgroundIntervalMs * 2 ** consecutiveFailures);
  }

  function scheduleNext(delayMs: number): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void tick(), delayMs);
    if (typeof timer.unref === "function") timer.unref();
  }

  /** One iteration of the proactive background refresh loop. Exposed as `_tick` for tests. */
  async function tick(): Promise<void> {
    const isIdle = now() - lastPolledAt > idleTimeoutMs;
    if (!isIdle && !inflight) {
      const age = fetchedAt !== null ? now() - fetchedAt : Number.POSITIVE_INFINITY;
      if (age >= backgroundIntervalMs && bucket.tryConsume(now())) {
        await doFetch();
      }
    }
    scheduleNext(backoffMs());
  }

  function start(): void {
    if (timer === null) scheduleNext(0);
  }

  function stop(): void {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function markPolled(): void {
    lastPolledAt = now();
  }

  /** Blocking bootstrap fetch for a cold cache, called from the loader so first paint has data. */
  async function ensureBootstrap(): Promise<void> {
    if (fetchedAt !== null) return;
    if (inflight) {
      await inflight;
      return;
    }
    if (bucket.tryConsume(now())) {
      await doFetch();
    }
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
   * Draws from the exact same bucket as the background loop — no separate
   * manual quota. If a fetch is already in flight (e.g. the background loop
   * just started one), piggyback on it instead of consuming a second token
   * for a request that wouldn't trigger any new Coinbase call anyway.
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

  if (options.autoStart !== false) start();

  return {
    markPolled,
    ensureBootstrap,
    getSnapshot,
    requestManualRefresh,
    getDebugBudget,
    stop,
    _tick: tick,
  };
}

export type RateCache = ReturnType<typeof createRateCache>;

declare global {
  var __rateCache: RateCache | undefined;
}

/** Single in-memory instance for this server process (see README's T1 limitation note). */
export const rateCache: RateCache =
  globalThis.__rateCache ?? (globalThis.__rateCache = createRateCache({ fetchRates: fetchExchangeRates }));
