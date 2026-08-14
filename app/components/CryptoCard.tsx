import { memo, type ComponentProps } from "react";
import { GripVertical } from "lucide-react";
import type { Coin, CoinRate } from "~/types/coin";

interface CryptoCardProps {
  coin: Coin;
  rate: CoinRate | undefined;
  /** Spread from dnd-kit's useSortable: ref + attributes + listeners, scoped to just the handle. */
  dragHandleProps?: ComponentProps<"button">;
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

function CryptoCardImpl({ coin, rate, dragHandleProps }: CryptoCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2 truncate">
          <span className="truncate font-semibold">{coin.name}</span>
          <span className="shrink-0 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {coin.code}
          </span>
        </div>
        {dragHandleProps && (
          <button
            type="button"
            aria-label={`Reorder ${coin.name}`}
            className="shrink-0 touch-none rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="mt-3 space-y-1 font-mono">
        <div className="text-lg text-gray-900 dark:text-gray-100">{rate ? formatUsd(rate.usd) : "—"}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{rate ? formatBtc(rate.btc) : "—"}</div>
      </div>
    </div>
  );
}

export const CryptoCard = memo(CryptoCardImpl);
