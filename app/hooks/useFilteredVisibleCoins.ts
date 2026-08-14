import { useMemo } from "react";
import { matchesQuery } from "~/utils/matchesQuery";
import type { Coin } from "~/types/coin";

export function useFilteredVisibleCoins(coins: Coin[], query: string): Coin[] {
  const trimmedQuery = query.trim();
  return useMemo(() => {
    if (!trimmedQuery) return coins;
    return coins.filter((coin) => matchesQuery(coin, trimmedQuery));
  }, [coins, trimmedQuery]);
}
