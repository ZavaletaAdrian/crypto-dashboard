import { useMemo } from "react";
import { matchesQuery } from "~/utils/matchesQuery";
import type { Coin } from "~/types/coin";

export function useFilteredVisibleCoins(coins: Coin[], query: string): Coin[] {
  return useMemo(() => coins.filter((coin) => matchesQuery(coin, query)), [coins, query]);
}
