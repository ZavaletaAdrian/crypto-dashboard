export const MAX_HISTORY_POINTS = 20;

/** Appends a real observed price to a bounded rolling window (oldest points drop off). */
export function appendPricePoint(history: number[], value: number): number[] {
  if (!Number.isFinite(value)) return history;
  const next = [...history, value];
  return next.length > MAX_HISTORY_POINTS ? next.slice(next.length - MAX_HISTORY_POINTS) : next;
}

/** Percent change from the oldest point still in the window to the newest. Null if not enough data yet. */
export function percentChange(history: number[]): number | null {
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  if (!Number.isFinite(first) || first === 0) return null;
  return ((last - first) / first) * 100;
}

export type Trend = "up" | "down" | "flat";

export function trendDirection(change: number | null): Trend {
  if (change === null || change === 0) return "flat";
  return change > 0 ? "up" : "down";
}
