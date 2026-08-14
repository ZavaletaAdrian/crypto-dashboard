import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildOrderPayload, mergeOrder, ORDER_STORAGE_KEY, parseOrderPayload } from "~/utils/orderPersistence";
import { reorderWithHidden } from "~/utils/reorderWithHidden";
import type { Coin } from "~/types/coin";

export interface UseOrderedCoinsResult {
  orderedCoins: Coin[];
  /** fromIndex/toIndex are positions within visibleCodes, not the full order. */
  reorderVisible: (fromIndex: number, toIndex: number, visibleCodes: string[]) => void;
}

/**
 * Owns the full, durable coin order (T3) and exposes a reorder operation
 * that preserves hidden coins' absolute positions when a filter is active
 * (T5, via reorderWithHidden).
 */
export function useOrderedCoins(catalog: Coin[]): UseOrderedCoinsResult {
  const catalogCodesRaw = catalog.map((coin) => coin.code);
  const catalogKey = catalogCodesRaw.join(",");
  // Stable reference as long as the content is unchanged, even though `catalog`
  // (and therefore catalogCodesRaw) gets a new array identity on every poll —
  // keeps effects below from re-running every ~2.5s for no reason.
  const catalogCodes = useMemo(() => (catalogKey ? catalogKey.split(",") : []), [catalogKey]);
  const coinByCode = useMemo(() => new Map(catalog.map((coin) => [coin.code, coin])), [catalog]);

  // Matches what the server renders (no localStorage access during SSR), so
  // hydration never diverges. localStorage is only read after mount, below.
  const [order, setOrder] = useState<string[]>(catalogCodes);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    } catch {
      // Storage disabled (e.g. some private-browsing modes) — fall back to catalog order below.
    }
    const stored = parseOrderPayload(raw);
    if (stored) {
      updatedAtRef.current = stored.updatedAt;
      setOrder((prev) => mergeOrder(stored.order, catalogCodes.length ? catalogCodes : prev));
    }
    // Runs once after mount to read localStorage exactly one time; the
    // separate effect below handles re-merging if the catalog itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-merge if the catalog's set of codes changes after mount (e.g. a coin
  // added to or removed from the curated list) — without this, a coin added
  // later would never make it into `order`/orderedCoins.
  useEffect(() => {
    setOrder((prev) => mergeOrder(prev, catalogCodes));
  }, [catalogCodes]);

  // Cross-tab sync: the `storage` event fires in *other* tabs when this key
  // changes. Last-write-wins by updatedAt — a synchronous write on every
  // drop (see persist below) is what makes "larger updatedAt wins" hold.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== ORDER_STORAGE_KEY || !event.newValue) return;
      const payload = parseOrderPayload(event.newValue);
      if (payload && payload.updatedAt > updatedAtRef.current) {
        updatedAtRef.current = payload.updatedAt;
        setOrder(mergeOrder(payload.order, catalogCodes));
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [catalogCodes]);

  const persist = useCallback((nextOrder: string[]) => {
    const updatedAt = Date.now();
    updatedAtRef.current = updatedAt;
    try {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(buildOrderPayload(nextOrder, updatedAt)));
    } catch {
      // Storage disabled or quota exceeded — reordering still works for the
      // rest of this session via React state, it just won't survive a reload.
    }
  }, []);

  const reorderVisible = useCallback(
    (fromIndex: number, toIndex: number, visibleCodes: string[]) => {
      // Uses the setState updater form (not the closed-over `order`) so a
      // second reorder invoked before React re-renders still computes from
      // the true latest order rather than a stale one.
      setOrder((prevOrder) => {
        const next = reorderWithHidden(prevOrder, visibleCodes, fromIndex, toIndex);
        // Synchronous, same-tick write: a reload immediately after this drop
        // can't race ahead of persistence.
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const orderedCoins = useMemo(
    () => order.map((code) => coinByCode.get(code)).filter((coin): coin is Coin => coin !== undefined),
    [order, coinByCode],
  );

  return { orderedCoins, reorderVisible };
}
