import { useState, useEffect } from "react";
import { appendPricePoint } from "~/utils/priceHistory";
import type { CoinRateMap } from "~/types/coin";

/**
 * Tracks a bounded rolling window of each coin's real observed USD price
 * across polls — no historical API call, no fabricated data. Coinbase's
 * exchange-rates endpoint has no historical/24h-change field, so this is
 * deliberately scoped as "recent, this session" rather than pretending to
 * be a 24h chart.
 */
export function usePriceHistory(rates: CoinRateMap): Partial<Record<string, number[]>> {
  const [historyByCode, setHistoryByCode] = useState<Partial<Record<string, number[]>>>({});

  useEffect(() => {
    setHistoryByCode((prev) => {
      // Clones lazily — only once we know there's a real update — rather
      // than unconditionally spreading `prev` up front: appendPricePoint
      // always returns a new array for any finite value, so an eager clone
      // would make this effectively always "changed" even when `rates` is
      // empty or every entry is missing/non-finite.
      let next: typeof prev | null = null;
      for (const [code, rate] of Object.entries(rates)) {
        if (!rate) continue;
        const existing = prev[code] ?? [];
        const appended = appendPricePoint(existing, rate.usd);
        if (appended === existing) continue;
        next ??= { ...prev };
        next[code] = appended;
      }
      return next ?? prev;
    });
  }, [rates]);

  return historyByCode;
}
