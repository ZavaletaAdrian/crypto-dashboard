import { describe, expect, it } from "vitest";
import { buildOrderPayload, isValidOrderPayload, mergeOrder, parseOrderPayload } from "./orderPersistence";

describe("isValidOrderPayload", () => {
  it("accepts a well-formed payload", () => {
    expect(isValidOrderPayload({ version: 1, updatedAt: 123, order: ["BTC", "ETH"] })).toBe(true);
  });

  it("rejects null, non-objects, and wrong-version payloads", () => {
    expect(isValidOrderPayload(null)).toBe(false);
    expect(isValidOrderPayload("not an object")).toBe(false);
    expect(isValidOrderPayload({ version: 2, updatedAt: 1, order: [] })).toBe(false);
  });

  it("rejects a payload with a non-array or non-string order", () => {
    expect(isValidOrderPayload({ version: 1, updatedAt: 1, order: "BTC,ETH" })).toBe(false);
    expect(isValidOrderPayload({ version: 1, updatedAt: 1, order: ["BTC", 42] })).toBe(false);
  });

  it("rejects a payload missing updatedAt", () => {
    expect(isValidOrderPayload({ version: 1, order: ["BTC"] })).toBe(false);
  });

  it("rejects a non-finite updatedAt (NaN/Infinity), which would break last-write-wins", () => {
    expect(isValidOrderPayload({ version: 1, updatedAt: Number.NaN, order: ["BTC"] })).toBe(false);
    expect(isValidOrderPayload({ version: 1, updatedAt: Number.POSITIVE_INFINITY, order: ["BTC"] })).toBe(false);
  });

  it("rejects an order containing duplicate codes", () => {
    expect(isValidOrderPayload({ version: 1, updatedAt: 1, order: ["BTC", "ETH", "BTC"] })).toBe(false);
  });
});

describe("parseOrderPayload", () => {
  it("parses valid JSON matching the schema", () => {
    const raw = JSON.stringify({ version: 1, updatedAt: 42, order: ["BTC", "ETH"] });
    expect(parseOrderPayload(raw)).toEqual({ version: 1, updatedAt: 42, order: ["BTC", "ETH"] });
  });

  it("returns null for null/empty input instead of throwing", () => {
    expect(parseOrderPayload(null)).toBeNull();
    expect(parseOrderPayload("")).toBeNull();
  });

  it("returns null for malformed JSON instead of throwing", () => {
    expect(parseOrderPayload("{not valid json")).toBeNull();
  });

  it("returns null for well-formed JSON that doesn't match the schema", () => {
    expect(parseOrderPayload(JSON.stringify({ foo: "bar" }))).toBeNull();
  });
});

describe("mergeOrder", () => {
  it("keeps the stored order when it already matches the catalog exactly", () => {
    expect(mergeOrder(["ETH", "BTC"], ["BTC", "ETH"])).toEqual(["ETH", "BTC"]);
  });

  it("drops stored codes no longer present in the catalog", () => {
    expect(mergeOrder(["BTC", "DEFUNCT", "ETH"], ["BTC", "ETH"])).toEqual(["BTC", "ETH"]);
  });

  it("appends new catalog codes missing from the stored order, at the end", () => {
    expect(mergeOrder(["ETH", "BTC"], ["BTC", "ETH", "SOL"])).toEqual(["ETH", "BTC", "SOL"]);
  });

  it("falls back to catalog order entirely when the stored order is empty", () => {
    expect(mergeOrder([], ["BTC", "ETH"])).toEqual(["BTC", "ETH"]);
  });
});

describe("buildOrderPayload", () => {
  it("builds a payload with the current schema version", () => {
    expect(buildOrderPayload(["BTC"], 123)).toEqual({ version: 1, updatedAt: 123, order: ["BTC"] });
  });
});
