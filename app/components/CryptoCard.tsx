import { memo, type ComponentProps } from "react";
import { GripVertical, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { percentChange, trendDirection } from "~/utils/priceHistory";
import { COIN_ICON_URLS } from "~/data/coinIcons";
import type { Coin, CoinRate } from "~/types/coin";

interface CryptoCardProps {
  coin: Coin;
  rate: CoinRate | undefined;
  /** Rolling window of this coin's real observed USD price, oldest first. */
  priceHistory: number[];
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

function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// Status palette (fixed, never themed — matches Sparkline's accent colors).
const TREND_TEXT_STYLES = {
  up: "text-[#0ca30c]",
  down: "text-[#d03b3b]",
  flat: "text-gray-400 dark:text-gray-500",
};

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };

function CryptoCardImpl({ coin, rate, priceHistory, dragHandleProps }: CryptoCardProps) {
  const iconUrl = COIN_ICON_URLS[coin.code];
  const change = percentChange(priceHistory);
  const trend = trendDirection(change);
  const TrendIcon = TREND_ICONS[trend];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {iconUrl ? (
            <img src={iconUrl} alt="" width={28} height={28} className="shrink-0 rounded-full" />
          ) : (
            <div className="h-7 w-7 shrink-0 rounded-full bg-gray-100 dark:bg-gray-800" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <div className="truncate leading-tight font-semibold">{coin.name}</div>
            <div className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">{coin.code}</div>
          </div>
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

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {rate ? formatUsd(rate.usd) : "—"}
          </div>
          <div className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
            {rate ? formatBtc(rate.btc) : "—"}
          </div>
        </div>

        {rate && priceHistory.length >= 2 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Sparkline values={priceHistory} trend={trend} />
            {change !== null && (
              <div className="flex flex-col items-end">
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${TREND_TEXT_STYLES[trend]}`}>
                  <TrendIcon className="h-3 w-3" aria-hidden="true" />
                  {formatPercent(change)}
                </span>
                {/* Visible, not just a hover title — a tooltip alone isn't reliably
                    discoverable on touch devices or by assistive tech, and without
                    it "+2.34%" reads like the 24h change most crypto UIs show. */}
                <span className="text-[10px] text-gray-400 dark:text-gray-500">this session</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const CryptoCard = memo(CryptoCardImpl);
