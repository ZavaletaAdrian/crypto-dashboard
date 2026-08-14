import type { Coin } from "~/types/coin";

/**
 * Curated default list (T2 is descoped for now — see README "Tension Decisions").
 * Names here are the resilience fallback (T4): a first-time visitor with the
 * Coinbase API down still sees real coin identity from this local list, no
 * network required. coin-catalog.server.ts overlays live names when available.
 */
export const TOP_COINS: Coin[] = [
  { code: "BTC", name: "Bitcoin" },
  { code: "ETH", name: "Ethereum" },
  { code: "USDT", name: "Tether" },
  { code: "USDC", name: "USD Coin" },
  { code: "XRP", name: "XRP" },
  { code: "SOL", name: "Solana" },
  { code: "ADA", name: "Cardano" },
  { code: "DOGE", name: "Dogecoin" },
  { code: "TRX", name: "TRON" },
  { code: "LINK", name: "Chainlink" },
  { code: "DOT", name: "Polkadot" },
  { code: "LTC", name: "Litecoin" },
  { code: "BCH", name: "Bitcoin Cash" },
  { code: "AVAX", name: "Avalanche" },
  { code: "UNI", name: "Uniswap" },
  { code: "ATOM", name: "Cosmos" },
  { code: "XLM", name: "Stellar" },
  { code: "ETC", name: "Ethereum Classic" },
];
