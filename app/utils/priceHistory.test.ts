import { describe, expect, it } from "vitest";
import { appendPricePoint, MAX_HISTORY_POINTS, percentChange, trendDirection } from "./priceHistory";

describe("appendPricePoint", () => {
  it("appends a value onto an empty history", () => {
    expect(appendPricePoint([], 100)).toEqual([100]);
  });

  it("drops the oldest point once the window exceeds MAX_HISTORY_POINTS", () => {
    const full = Array.from({ length: MAX_HISTORY_POINTS }, (_, i) => i);
    const result = appendPricePoint(full, 999);
    expect(result).toHaveLength(MAX_HISTORY_POINTS);
    expect(result[0]).toBe(1); // oldest (0) dropped
    expect(result.at(-1)).toBe(999);
  });

  it("ignores a non-finite value instead of corrupting the history", () => {
    expect(appendPricePoint([1, 2], Number.NaN)).toEqual([1, 2]);
    expect(appendPricePoint([1, 2], Number.POSITIVE_INFINITY)).toEqual([1, 2]);
  });
});

describe("percentChange", () => {
  it("returns null when there isn't at least two points yet", () => {
    expect(percentChange([])).toBeNull();
    expect(percentChange([100])).toBeNull();
  });

  it("computes percent change from the oldest to the newest point in the window", () => {
    expect(percentChange([100, 110])).toBeCloseTo(10);
    expect(percentChange([100, 90])).toBeCloseTo(-10);
  });

  it("returns null rather than dividing by zero when the first point is 0", () => {
    expect(percentChange([0, 5])).toBeNull();
  });

  it("returns null instead of NaN% when the last point is non-finite", () => {
    expect(percentChange([100, Number.NaN])).toBeNull();
  });

  it("rounds to 2 decimals so trendDirection's up/down classification matches what's displayed", () => {
    // An unrounded change here is a tiny positive fraction that displays as
    // "0.00%" — it must round to exactly 0, not a misleading near-zero "up".
    const change = percentChange([100, 100.00001]);
    expect(change).toBe(0);
    expect(trendDirection(change)).toBe("flat");
  });
});

describe("trendDirection", () => {
  it("maps positive/negative/null/zero change to up/down/flat", () => {
    expect(trendDirection(5)).toBe("up");
    expect(trendDirection(-5)).toBe("down");
    expect(trendDirection(0)).toBe("flat");
    expect(trendDirection(null)).toBe("flat");
  });
});
