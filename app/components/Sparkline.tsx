import { useId } from "react";
import { STATUS_COLOR } from "~/data/statusPalette";
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
  // Unique per instance — this page renders one Sparkline per card, and an
  // SVG filter id is a global DOM id, so a shared literal would make every
  // card's glow reference whichever <filter> happened to be first in the DOM.
  const glowId = `sparkline-glow-${useId()}`;

  if (values.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const isFlat = max === min;
  const range = max - min || 1;
  // Reserve room for the end marker's radius on every edge — top/bottom AND
  // left/right, since the marker sits at the LAST point, i.e. x = width — so
  // neither the marker nor the line's stroke clips against the viewBox. Also
  // renders a flat series (all equal) as a centered line instead of pegged
  // to one edge.
  const drawableWidth = width - MARKER_RADIUS * 2;
  const drawableHeight = height - MARKER_RADIUS * 2;
  const stepX = drawableWidth / (values.length - 1);
  const points = values.map((value, i) => ({
    x: MARKER_RADIUS + i * stepX,
    y: isFlat ? height / 2 : MARKER_RADIUS + drawableHeight - ((value - min) / range) * drawableHeight,
  }));
  const linePath = `M${points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" L")}`;
  const last = points[points.length - 1];
  const accent = trend === "up" ? STATUS_COLOR.good : trend === "down" ? STATUS_COLOR.critical : STATUS_COLOR.muted;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Recent price trend: ${trend}`}
    >
      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={linePath}
        fill="none"
        style={{ stroke: STATUS_COLOR.muted }}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r={MARKER_RADIUS} style={{ fill: accent, filter: `url(#${glowId})` }} />
    </svg>
  );
}
