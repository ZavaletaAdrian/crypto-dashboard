import { STATUS_COLOR_HEX } from "~/data/statusPalette";
import type { Trend } from "~/utils/priceHistory";

interface SparklineProps {
  values: number[];
  trend: Trend;
  width?: number;
  height?: number;
}

/**
 * A trend sparkline over however many points it's given (bounded upstream by
 * MAX_HISTORY_POINTS): the line itself stays in the de-emphasis (muted) hue,
 * with only the current/latest point picked out in the status accent color
 * (good/critical) — per the stat-tile "trend" spec, not a rainbow-by-direction line.
 */
const MARKER_RADIUS = 4;

export function Sparkline({ values, trend, width = 64, height = 24 }: SparklineProps) {
  if (values.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const isFlat = max === min;
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  // Reserve room for the end marker's radius on both edges so a value at the
  // very top/bottom of the range doesn't clip the circle against the
  // viewBox — and render a flat series (all equal) as a centered line
  // instead of pegged to one edge.
  const drawableHeight = height - MARKER_RADIUS * 2;
  const points = values.map((value, i) => ({
    x: i * stepX,
    y: isFlat ? height / 2 : MARKER_RADIUS + drawableHeight - ((value - min) / range) * drawableHeight,
  }));
  const linePath = `M${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L")}`;
  const last = points[points.length - 1];
  const accent =
    trend === "up" ? STATUS_COLOR_HEX.good : trend === "down" ? STATUS_COLOR_HEX.critical : STATUS_COLOR_HEX.muted;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Recent price trend: ${trend}`}
    >
      <path
        d={linePath}
        fill="none"
        stroke={STATUS_COLOR_HEX.muted}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r={MARKER_RADIUS} fill={accent} />
    </svg>
  );
}
