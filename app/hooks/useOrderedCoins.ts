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
  const catalogCodes = useMemo(() => catalog.map((coin) => coin.code), [catalog]);
  const coinByCode = useMemo(() => new Map(catalog.map((coin) => [coin.code, coin])), [catalog]);

  // Matches what the server renders (no localStorage access during SSR), so
  // hydration never diverges. localStorage is only read after mount, below.
  const [order, setOrder] = useState<string[]>(catalogCodes);
  const updatedAtRef = useRef(0);

  useEffect(() => {
    const stored = parseOrderPayload(window.localStorage.getItem(ORDER_STORAGE_KEY));
    if (stored) {
      updatedAtRef.current = stored.updatedAt;
      setOrder((prev) => mergeOrder(stored.order, catalogCodes.length ? catalogCodes : prev));
    }
    // Runs once after mount to hydrate from localStorage; catalogCodes is a
    // fixed curated list in practice, so re-running on every reference
    // change isn't needed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(buildOrderPayload(nextOrder, updatedAt)));
  }, []);

  const reorderVisible = useCallback(
    (fromIndex: number, toIndex: number, visibleCodes: string[]) => {
      const next = reorderWithHidden(order, visibleCodes, fromIndex, toIndex);
      setOrder(next);
      // Synchronous, same-tick write: a reload immediately after this drop
      // can't race ahead of persistence.
      persist(next);
    },
    [order, persist],
  );

  const orderedCoins = useMemo(
    () => order.map((code) => coinByCode.get(code)).filter((coin): coin is Coin => coin !== undefined),
    [order, coinByCode],
  );

  return { orderedCoins, reorderVisible };
}
