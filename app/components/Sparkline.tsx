import type { Trend } from "~/utils/priceHistory";

interface SparklineProps {
  values: number[];
  trend: Trend;
  width?: number;
  height?: number;
}

// Status palette (fixed, never themed — see dataviz skill's palette.md).
const GOOD = "#0ca30c";
const CRITICAL = "#d03b3b";
const MUTED = "#898781";

/**
 * A 12-ish point trend sparkline: the line itself stays in the de-emphasis
 * (muted) hue, with only the current/latest point picked out in the status
 * accent color (good/critical) — per the stat-tile "trend" spec, not a
 * rainbow-by-direction line.
 */
export function Sparkline({ values, trend, width = 64, height = 24 }: SparklineProps) {
  if (values.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((value, i) => ({
    x: i * stepX,
    y: height - ((value - min) / range) * height,
  }));
  const linePath = `M${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L")}`;
  const last = points[points.length - 1];
  const accent = trend === "up" ? GOOD : trend === "down" ? CRITICAL : MUTED;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Recent price trend: ${trend}`}
    >
      <path d={linePath} fill="none" stroke={MUTED} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={4} fill={accent} />
    </svg>
  );
}
