export interface Coin {
  code: string;
  name: string;
}

export interface CoinRate {
  usd: number;
  btc: number;
}

/** Sparse by design — Coinbase's response doesn't cover every coin code we display. */
export type CoinRateMap = Partial<Record<string, CoinRate>>;

export type StalenessTier = "live" | "delayed" | "stale" | "never";

export interface OrderPayload {
  version: 1;
  updatedAt: number;
  order: string[];
}
