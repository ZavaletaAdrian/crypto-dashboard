import { describe, expect, it, vi } from "vitest";
import { createRateCache } from "./rate-cache.server";

function makeFetchRates(rates: Record<string, string>) {
  return vi.fn(async () => ({ currency: "USD", rates }));
}

describe("rate cache", () => {
  it("derives both USD and BTC pricing for every coin from one Coinbase call", async () => {
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002", ETH: "0.0006" });
    const cache = createRateCache({ fetchRates, autoStart: false });

    await cache.ensureBootstrap();

    expect(fetchRates).toHaveBeenCalledTimes(1);
    const snapshot = cache.getSnapshot();
    expect(snapshot.tier).toBe("live");
    expect(snapshot.ratesByCode.BTC).toBeDefined();
    expect(snapshot.ratesByCode.ETH).toBeDefined();
    expect(snapshot.ratesByCode.BTC?.usd).toBeCloseTo(1 / 0.00002);
    expect(snapshot.ratesByCode.BTC?.btc).toBeCloseTo(1);
    expect(snapshot.ratesByCode.ETH?.btc).toBeCloseTo(0.00002 / 0.0006);
  });

  it("does not re-fetch on a second bootstrap once the cache is warm", async () => {
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({ fetchRates, autoStart: false });

    await cache.ensureBootstrap();
    await cache.ensureBootstrap();

    expect(fetchRates).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent bootstrap calls (multiple tabs at cold start) into a single fetch", async () => {
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({ fetchRates, autoStart: false });

    await Promise.all([cache.ensureBootstrap(), cache.ensureBootstrap(), cache.ensureBootstrap()]);

    expect(fetchRates).toHaveBeenCalledTimes(1);
  });

  it("manual refresh shares the same token bucket as the background loop and never exceeds capacity", async () => {
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({
      fetchRates,
      capacity: 3,
      refillIntervalMs: 6000,
      manualGuardMs: 0,
      autoStart: false,
    });

    await cache.ensureBootstrap();
    const r1 = await cache.requestManualRefresh();
    const r2 = await cache.requestManualRefresh();
    const r3 = await cache.requestManualRefresh();

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(false);
    expect(r3.retryAfterMs).toBeGreaterThan(0);
    expect(fetchRates).toHaveBeenCalledTimes(3);
  });

  it("does not consume a second token when a manual refresh overlaps an already in-flight fetch", async () => {
    let resolveFetch: (() => void) | undefined;
    const fetchRates = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveFetch = resolve;
        }).then(() => ({ currency: "USD", rates: { USD: "1", BTC: "0.00002" } })),
    );
    const cache = createRateCache({ fetchRates, capacity: 5, manualGuardMs: 0, autoStart: false });

    const p1 = cache.requestManualRefresh();
    const p2 = cache.requestManualRefresh();
    expect(resolveFetch).toBeTypeOf("function"); // fail fast if setup didn't run rather than hang on Promise.all
    resolveFetch!();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(fetchRates).toHaveBeenCalledTimes(1);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(cache.getDebugBudget().tokensAvailable).toBe(4);
  });

  it("reports ok: false when a piggybacked in-flight fetch ultimately fails, rather than assuming success", async () => {
    let rejectFetch: ((err: Error) => void) | undefined;
    const fetchRates = vi.fn(
      () =>
        new Promise<{ currency: string; rates: Record<string, string> }>((_resolve, reject) => {
          rejectFetch = reject;
        }),
    );
    const cache = createRateCache({ fetchRates, capacity: 5, manualGuardMs: 0, autoStart: false });

    const p1 = cache.requestManualRefresh();
    const p2 = cache.requestManualRefresh();
    expect(rejectFetch).toBeTypeOf("function");
    rejectFetch!(new Error("network down"));
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(fetchRates).toHaveBeenCalledTimes(1);
    expect(r1.ok).toBe(false);
    expect(r2.ok).toBe(false);
  });

  it("stays in the 'never' tier after a failed fetch rather than reporting stale numbers", async () => {
    const fetchRates = vi.fn(async () => {
      throw new Error("network down");
    });
    const cache = createRateCache({ fetchRates, autoStart: false });

    await cache.ensureBootstrap();

    const snapshot = cache.getSnapshot();
    expect(snapshot.tier).toBe("never");
    expect(snapshot.lastError).toMatch(/network down/);
  });

  it("proactive tick refreshes once the cache ages past the background interval, given an active poller", async () => {
    let now = 0;
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({
      fetchRates,
      now: () => now,
      backgroundIntervalMs: 8000,
      idleTimeoutMs: 30_000,
      autoStart: false,
    });

    await cache.ensureBootstrap();
    cache.markPolled();
    expect(fetchRates).toHaveBeenCalledTimes(1);

    now += 8000;
    await cache._tick();
    expect(fetchRates).toHaveBeenCalledTimes(2);
  });

  it("reports a correct 'live' tier even when the injected clock's fetch timestamp is exactly 0", async () => {
    // Regression test: `fetchedAt ? ... : null` treats a legitimate 0 timestamp as
    // falsy, misreporting "never fetched". Guards against that truthy-check bug.
    let now = 0;
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({ fetchRates, now: () => now, autoStart: false });

    await cache.ensureBootstrap();
    now += 5;

    const snapshot = cache.getSnapshot();
    expect(snapshot.fetchedAt).toBe(0);
    expect(snapshot.ageMs).toBe(5);
    expect(snapshot.tier).toBe("live");
  });

  it("pauses the proactive loop when idle so it doesn't spend budget with no viewers", async () => {
    let now = 0;
    const fetchRates = makeFetchRates({ USD: "1", BTC: "0.00002" });
    const cache = createRateCache({
      fetchRates,
      now: () => now,
      backgroundIntervalMs: 8000,
      idleTimeoutMs: 30_000,
      autoStart: false,
    });

    await cache.ensureBootstrap();
    now += 40_000;
    await cache._tick();

    expect(fetchRates).toHaveBeenCalledTimes(1);
  });
});
