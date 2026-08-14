import { describe, expect, it } from "vitest";
import { matchesQuery } from "./matchesQuery";

const ETH = { code: "ETH", name: "Ethereum" };

describe("matchesQuery", () => {
  it("matches by a partial, case-insensitive name", () => {
    expect(matchesQuery(ETH, "eth")).toBe(true);
    expect(matchesQuery(ETH, "Ether")).toBe(true);
    expect(matchesQuery(ETH, "ETHEREUM")).toBe(true);
  });

  it("matches by a partial, case-insensitive code", () => {
    expect(matchesQuery(ETH, "eth")).toBe(true);
    expect(matchesQuery({ code: "BTC", name: "Bitcoin" }, "btc")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    expect(matchesQuery(ETH, "solana")).toBe(false);
  });

  it("treats an empty or whitespace-only query as matching everything", () => {
    expect(matchesQuery(ETH, "")).toBe(true);
    expect(matchesQuery(ETH, "   ")).toBe(true);
  });

  it("trims surrounding whitespace before matching", () => {
    expect(matchesQuery(ETH, "  eth  ")).toBe(true);
  });
});
