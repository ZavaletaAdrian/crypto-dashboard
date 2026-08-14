import type { Coin } from "~/types/coin";

export function matchesQuery(coin: Coin, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return coin.name.toLowerCase().includes(normalized) || coin.code.toLowerCase().includes(normalized);
}
