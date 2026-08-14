import { fetchCryptoCurrencies } from "./coinbase.server";
import { TOP_COINS } from "~/data/top-coins";
import type { Coin } from "~/types/coin";

const CATALOG_TTL_MS = 6 * 60 * 60 * 1000;

interface CatalogState {
  namesByCode: Record<string, string>;
  fetchedAt: number | null;
  inflight: Promise<void> | null;
}

declare global {
  var __coinCatalogState: CatalogState | undefined;
}

const state: CatalogState =
  globalThis.__coinCatalogState ??
  (globalThis.__coinCatalogState = { namesByCode: {}, fetchedAt: null, inflight: null });

async function refreshCatalog(): Promise<void> {
  if (state.inflight) return state.inflight;
  state.inflight = (async () => {
    try {
      const currencies = await fetchCryptoCurrencies();
      const namesByCode: Record<string, string> = {};
      for (const currency of currencies) {
        namesByCode[currency.code] = currency.name;
      }
      state.namesByCode = namesByCode;
      state.fetchedAt = Date.now();
    } catch {
      // Non-critical: names fall back to the local TOP_COINS list below.
    } finally {
      state.inflight = null;
    }
  })();
  return state.inflight;
}

/**
 * Joins the curated coin list with live names from Coinbase, long-TTL cached
 * since names change essentially never — this refresh is independent of the
 * rates cadence and doesn't compete for the 10 req/min exchange-rate budget.
 */
export async function getCoinCatalog(): Promise<Coin[]> {
  const isStale = state.fetchedAt === null || Date.now() - state.fetchedAt > CATALOG_TTL_MS;
  if (isStale && !state.inflight) {
    void refreshCatalog();
  }
  return TOP_COINS.map((coin) => ({
    code: coin.code,
    name: state.namesByCode[coin.code] ?? coin.name,
  }));
}
