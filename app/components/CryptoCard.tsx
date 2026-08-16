import { memo, type ComponentProps } from "react";
import { GripVertical, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { percentChange, trendDirection, type Trend } from "~/utils/priceHistory";
import { useValueChangeFlash } from "~/hooks/useValueChangeFlash";
import { COIN_ICON_URLS } from "~/data/coinIcons";
import { STATUS_COLOR } from "~/data/statusPalette";
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

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus };

// Inline style (not a Tailwind class) so this shares one source of truth
// with Sparkline's SVG colors via STATUS_COLOR — a Tailwind arbitrary
// class built from an imported constant (e.g. `text-[${hex}]`) wouldn't be
// picked up by Tailwind's static source scan and would silently not apply.
// (The chassis tokens below are the opposite case — a literal, static
// `var(--panel-x)` string Tailwind's scanner can see at build time — so
// those are plain arbitrary-value classes, not inline style.)
function trendColor(trend: Trend): string {
  if (trend === "up") return STATUS_COLOR.good;
  if (trend === "down") return STATUS_COLOR.critical;
  return STATUS_COLOR.muted;
}

function CryptoCardImpl({ coin, rate, priceHistory, dragHandleProps }: CryptoCardProps) {
  const iconUrl = COIN_ICON_URLS[coin.code];
  const change = percentChange(priceHistory);
  const trend = trendDirection(change);
  const TrendIcon = TREND_ICONS[trend];
  const usdDisplay = rate ? formatUsd(rate.usd) : "—";
  const priceChanged = useValueChangeFlash(usdDisplay);

  return (
    <div className="ds-chassis-panel rounded-lg border border-[var(--panel-border)] bg-[var(--panel-chassis)] p-4 hover:border-[var(--panel-amber)]/40 motion-safe:transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {iconUrl ? (
            <img src={iconUrl} alt="" width={28} height={28} className="shrink-0 rounded-full" />
          ) : (
            <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--panel-border)]" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <h2 className="truncate leading-tight font-semibold text-[var(--panel-text-primary)]">{coin.name}</h2>
            <div className="font-mono text-xs font-medium tracking-wide text-[var(--panel-text-secondary)] uppercase">
              {coin.code}
            </div>
          </div>
        </div>
        {dragHandleProps && (
          // Circular, not the rounded-lg squares every other icon control
          // uses — reads as a countersunk panel fastener (a mount point you
          // grab), not a generic icon button wearing the panel's colors.
          <button
            type="button"
            aria-label={`Reorder ${coin.name}`}
            className="ds-panel-fastener shrink-0 touch-none rounded-full border border-[var(--panel-border)] p-2.5 text-[var(--panel-text-secondary)] hover:border-[var(--panel-amber)]/40 hover:text-[var(--panel-amber)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-amber)] motion-safe:transition-colors"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {/* The instrument's own readout: tabular mono digits. Lit (amber,
              glowing in dark mode) only when a real reading exists — a coin
              with no rate yet is an unlit tube, not a "reading" that was
              never taken. data-changed briefly true on a real price change
              (useValueChangeFlash) triggers the cross-fade in app.css — the
              signature "digit tube" interaction, not a per-poll flourish. */}
          <div
            className={`ds-digit-readout text-xl font-semibold ${rate ? "ds-digit-readout--lit" : "text-[var(--panel-text-secondary)]"}`}
            data-changed={priceChanged}
          >
            {usdDisplay}
          </div>
          <div className="mt-0.5 font-mono text-xs text-[var(--panel-text-secondary)]">
            {rate ? formatBtc(rate.btc) : "—"}
          </div>
        </div>

        {rate && priceHistory.length >= 2 && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Sparkline values={priceHistory} trend={trend} />
            {change !== null && (
              <div className="flex flex-col items-end">
                <span
                  className="inline-flex items-center gap-0.5 text-xs font-medium"
                  style={{ color: trendColor(trend) }}
                >
                  <TrendIcon className="h-3 w-3" aria-hidden="true" />
                  {formatPercent(change)}
                </span>
                {/* Visible, not just a hover title — a tooltip alone isn't reliably
                    discoverable on touch devices or by assistive tech. "recent" (not
                    "this session") because priceHistory is a bounded rolling window —
                    older points drop off, so this isn't a full-session change once the
                    window fills, and it must not be misread as the 24h change most
                    crypto UIs show. */}
                <span className="text-xs text-[var(--panel-text-secondary)]">recent</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const CryptoCard = memo(CryptoCardImpl);
