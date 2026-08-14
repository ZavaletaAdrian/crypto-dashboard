export interface Coin {
  code: string;
  name: string;
}

export interface CoinRate {
  usd: number;
  btc: number;
}

export type StalenessTier = "live" | "delayed" | "stale" | "never";

export interface OrderPayload {
  version: 1;
  updatedAt: number;
  order: string[];
}
