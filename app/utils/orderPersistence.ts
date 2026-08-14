import type { OrderPayload } from "~/types/coin";

export const ORDER_STORAGE_KEY = "crypto-dashboard:coin-order:v1";
export const ORDER_PAYLOAD_VERSION = 1;

export function isValidOrderPayload(value: unknown): value is OrderPayload {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.version !== ORDER_PAYLOAD_VERSION ||
    typeof candidate.updatedAt !== "number" ||
    !Number.isFinite(candidate.updatedAt) ||
    !Array.isArray(candidate.order) ||
    !candidate.order.every((code) => typeof code === "string")
  ) {
    return false;
  }
  // Duplicate codes would render the same coin twice (and produce a
  // duplicate React key) — NaN/Infinity timestamps would break the
  // last-write-wins comparison used for cross-tab sync.
  return new Set(candidate.order).size === candidate.order.length;
}

/** Parses and validates raw localStorage content. Never throws — invalid/corrupt input becomes null. */
export function parseOrderPayload(raw: string | null): OrderPayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValidOrderPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Repairs a stored order against the live catalog rather than discarding it
 * wholesale: unknown stored codes are dropped (a coin removed from the
 * curated list), and catalog codes missing from the stored order (added
 * since the user's last visit) are appended at the end — preserving as much
 * of the user's intent as possible.
 */
export function mergeOrder(storedOrder: string[], catalogCodes: string[]): string[] {
  const catalogSet = new Set(catalogCodes);
  const kept = storedOrder.filter((code) => catalogSet.has(code));
  const keptSet = new Set(kept);
  const appended = catalogCodes.filter((code) => !keptSet.has(code));
  return [...kept, ...appended];
}

export function buildOrderPayload(order: string[], updatedAt: number): OrderPayload {
  return { version: ORDER_PAYLOAD_VERSION, updatedAt, order };
}
