export interface TokenBucketOptions {
  capacity: number;
  refillIntervalMs: number;
  now?: () => number;
}

/**
 * Continuous-refill token bucket (not fixed-window): tokens trickle back in
 * proportional to elapsed time, so there's no window boundary that lets two
 * back-to-back bursts double the effective rate.
 */
export class TokenBucket {
  private readonly capacity: number;
  private readonly refillIntervalMs: number;
  private readonly now: () => number;
  private tokens: number;
  private lastRefillAt: number;

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.refillIntervalMs = options.refillIntervalMs;
    this.now = options.now ?? Date.now;
    this.tokens = options.capacity;
    this.lastRefillAt = this.now();
  }

  private refill(now: number): void {
    const elapsed = now - this.lastRefillAt;
    if (elapsed <= 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed / this.refillIntervalMs);
    this.lastRefillAt = now;
  }

  tryConsume(now: number = this.now()): boolean {
    this.refill(now);
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  msUntilNextToken(now: number = this.now()): number {
    this.refill(now);
    if (this.tokens >= 1) return 0;
    // Subtract a tiny epsilon to absorb floating-point drift from the refill
    // division/multiplication round trip (e.g. 0.6666...*6000 landing a hair over 4000).
    return Math.ceil((1 - this.tokens) * this.refillIntervalMs - 1e-6);
  }

  snapshot(now: number = this.now()): { tokensAvailable: number; capacity: number } {
    this.refill(now);
    return { tokensAvailable: Math.floor(this.tokens), capacity: this.capacity };
  }
}
