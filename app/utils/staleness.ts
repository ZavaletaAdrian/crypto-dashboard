import type { StalenessTier } from "~/types/coin";

export const LIVE_THRESHOLD_MS = 10_000;
export const DELAYED_THRESHOLD_MS = 60_000;

/**
 * ageMs === null means no successful fetch has ever completed — distinct from
 * "stale" because there's no prior data to call stale (see T4 in the README).
 */
export function computeStalenessTier(ageMs: number | null): StalenessTier {
  if (ageMs === null) return "never";
  if (ageMs <= LIVE_THRESHOLD_MS) return "live";
  if (ageMs <= DELAYED_THRESHOLD_MS) return "delayed";
  return "stale";
}
