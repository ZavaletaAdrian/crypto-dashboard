import { describe, expect, it } from "vitest";
import { computeStalenessTier } from "./staleness";

describe("computeStalenessTier", () => {
  it("is 'never' when nothing has been fetched yet", () => {
    expect(computeStalenessTier(null)).toBe("never");
  });

  it("is 'live' at and under the 10s boundary", () => {
    expect(computeStalenessTier(0)).toBe("live");
    expect(computeStalenessTier(9_999)).toBe("live");
    expect(computeStalenessTier(10_000)).toBe("live");
  });

  it("is 'delayed' between 10s and 60s", () => {
    expect(computeStalenessTier(10_001)).toBe("delayed");
    expect(computeStalenessTier(60_000)).toBe("delayed");
  });

  it("is 'stale' beyond the 60s boundary", () => {
    expect(computeStalenessTier(60_001)).toBe("stale");
    expect(computeStalenessTier(1_000_000)).toBe("stale");
  });
});
