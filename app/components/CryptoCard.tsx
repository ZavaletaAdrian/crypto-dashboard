import { memo } from "react";
import type { Coin, CoinRate } from "~/types/coin";

interface CryptoCardProps {
  coin: Coin;
  rate: CoinRate | undefined;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1) {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  }
  return `$${value.toPrecision(4)}`;
}

function formatBtc(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(8)} BTC`;
}

function CryptoCardImpl({ coin, rate }: CryptoCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-semibold">{coin.name}</span>
        <span className="shrink-0 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{coin.code}</span>
      </div>
      <div className="mt-3 space-y-1 font-mono">
        <div className="text-lg text-gray-900 dark:text-gray-100">{rate ? formatUsd(rate.usd) : "—"}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{rate ? formatBtc(rate.btc) : "—"}</div>
      </div>
    </div>
  );
}

export const CryptoCard = memo(CryptoCardImpl);
