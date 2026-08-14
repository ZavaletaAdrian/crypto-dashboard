import { describe, expect, it } from "vitest";
import { TokenBucket } from "./tokenBucket";

describe("TokenBucket", () => {
  it("starts full and rejects once capacity is exhausted", () => {
    let now = 0;
    const bucket = new TokenBucket({ capacity: 10, refillIntervalMs: 6000, now: () => now });
    for (let i = 0; i < 10; i++) {
      expect(bucket.tryConsume(now)).toBe(true);
    }
    expect(bucket.tryConsume(now)).toBe(false);
  });

  it("refills continuously rather than in a fixed-window burst", () => {
    let now = 0;
    const bucket = new TokenBucket({ capacity: 10, refillIntervalMs: 6000, now: () => now });
    for (let i = 0; i < 10; i++) bucket.tryConsume(now);
    expect(bucket.tryConsume(now)).toBe(false);

    now += 6000;
    expect(bucket.tryConsume(now)).toBe(true);
    expect(bucket.tryConsume(now)).toBe(false);

    now += 3000;
    expect(bucket.tryConsume(now)).toBe(false);
    now += 3000;
    expect(bucket.tryConsume(now)).toBe(true);
  });

  it("never exceeds capacity even after a long idle period", () => {
    let now = 0;
    const bucket = new TokenBucket({ capacity: 10, refillIntervalMs: 6000, now: () => now });
    for (let i = 0; i < 10; i++) bucket.tryConsume(now);

    now += 1000 * 60 * 60;
    for (let i = 0; i < 10; i++) {
      expect(bucket.tryConsume(now)).toBe(true);
    }
    expect(bucket.tryConsume(now)).toBe(false);
  });

  it("reports an accurate wait time until the next token", () => {
    let now = 0;
    const bucket = new TokenBucket({ capacity: 1, refillIntervalMs: 6000, now: () => now });
    expect(bucket.tryConsume(now)).toBe(true);
    expect(bucket.msUntilNextToken(now)).toBe(6000);

    now += 2000;
    expect(bucket.msUntilNextToken(now)).toBe(4000);
  });
});
