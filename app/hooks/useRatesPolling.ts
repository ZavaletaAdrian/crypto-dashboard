import { useCallback, useEffect, useRef, useState } from "react";
import { computeStalenessTier } from "~/utils/staleness";
import type { RatesPayload } from "~/types/rates";

const POLL_INTERVAL_MS = 2500;

export type RefreshState = "idle" | "refreshing";

export interface UseRatesPollingResult {
  coins: RatesPayload["coins"];
  rates: RatesPayload["rates"];
  fetchedAt: number | null;
  ageMs: number | null;
  tier: RatesPayload["tier"];
  lastError: string | null;
  budget: RatesPayload["budget"];
  refresh: () => Promise<void>;
  refreshState: RefreshState;
  retryAvailableAt: number | null;
}

/**
 * Polls the internal /api/rates route (never Coinbase directly) and derives a
 * live, clock-skew-safe age: each poll anchors ageMs to the client's own
 * clock at receipt time, then a 1s tick advances it locally rather than
 * trusting the server's Date.now() to match the client's.
 */
export function useRatesPolling(initial: RatesPayload): UseRatesPollingResult {
  const [snapshot, setSnapshot] = useState(initial);
  const syncedAtRef = useRef(Date.now());
  const [, forceTick] = useState(0);
  const [refreshState, setRefreshState] = useState<RefreshState>("idle");
  const [retryAvailableAt, setRetryAvailableAt] = useState<number | null>(null);

  const applySnapshot = useCallback((payload: RatesPayload) => {
    setSnapshot(payload);
    syncedAtRef.current = Date.now();
  }, []);

  // Resync if the loader hands us fresh initial data (e.g. a full revalidation).
  useEffect(() => {
    applySnapshot(initial);
  }, [initial, applySnapshot]);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Guards against a slower response landing after a newer one and
  // overwriting fresher data with stale data.
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const id = setInterval(() => {
      const requestId = ++latestRequestIdRef.current;
      fetch("/api/rates", { signal: controller.signal })
        .then((res) => (res.ok ? (res.json() as Promise<RatesPayload>) : null))
        .then((payload) => {
          if (payload && requestId === latestRequestIdRef.current) applySnapshot(payload);
        })
        .catch(() => {
          // Transient network hiccup on an internal poll — next tick retries;
          // the staleness tier already communicates this to the user.
        });
    }, POLL_INTERVAL_MS);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [applySnapshot]);

  const refresh = useCallback(async () => {
    setRefreshState("refreshing");
    try {
      const res = await fetch("/api/rates", { method: "POST" });
      if (!res.ok) return;
      const payload = (await res.json()) as RatesPayload & { refreshOk: boolean; retryAfterMs: number | null };
      applySnapshot(payload);
      setRetryAvailableAt(payload.refreshOk ? null : Date.now() + (payload.retryAfterMs ?? 0));
    } catch {
      // Transient network hiccup on a manual refresh — leave prior data in
      // place and let the next click or the background poll recover.
    } finally {
      setRefreshState("idle");
    }
  }, [applySnapshot]);

  const ageMs = snapshot.ageMs !== null ? snapshot.ageMs + (Date.now() - syncedAtRef.current) : null;

  return {
    coins: snapshot.coins,
    rates: snapshot.rates,
    fetchedAt: snapshot.fetchedAt,
    ageMs,
    tier: computeStalenessTier(ageMs),
    lastError: snapshot.lastError,
    budget: snapshot.budget,
    refresh,
    refreshState,
    retryAvailableAt,
  };
}
