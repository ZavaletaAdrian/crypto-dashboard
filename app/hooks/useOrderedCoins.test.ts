import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useOrderedCoins } from "./useOrderedCoins";
import { ORDER_STORAGE_KEY, buildOrderPayload } from "~/utils/orderPersistence";

const CATALOG = [
  { code: "BTC", name: "Bitcoin" },
  { code: "ETH", name: "Ethereum" },
  { code: "SOL", name: "Solana" },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("useOrderedCoins", () => {
  it("uses catalog order when nothing is stored", async () => {
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => {
      expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["BTC", "ETH", "SOL"]);
    });
  });

  it("hydrates from a valid stored order after mount", async () => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(buildOrderPayload(["SOL", "BTC", "ETH"], 100)));
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => {
      expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["SOL", "BTC", "ETH"]);
    });
  });

  it("falls back to catalog order when localStorage content is corrupt", async () => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, "{not valid json");
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => {
      expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["BTC", "ETH", "SOL"]);
    });
  });

  it("persists synchronously on reorder, so an immediate reload can't race ahead of the write", async () => {
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => expect(result.current.orderedCoins).toHaveLength(3));

    act(() => {
      result.current.reorderVisible(0, 2, ["BTC", "ETH", "SOL"]);
    });

    expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["ETH", "SOL", "BTC"]);
    const stored = JSON.parse(window.localStorage.getItem(ORDER_STORAGE_KEY) ?? "null");
    expect(stored.order).toEqual(["ETH", "SOL", "BTC"]);
  });

  it("adopts a newer order arriving from another tab via the storage event (last-write-wins)", async () => {
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => expect(result.current.orderedCoins).toHaveLength(3));

    const newerPayload = buildOrderPayload(["SOL", "ETH", "BTC"], Date.now() + 10_000);
    act(() => {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newerPayload));
      window.dispatchEvent(
        new StorageEvent("storage", { key: ORDER_STORAGE_KEY, newValue: JSON.stringify(newerPayload) }),
      );
    });

    expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["SOL", "ETH", "BTC"]);
  });

  it("ignores a stale order arriving from another tab", async () => {
    const { result } = renderHook(() => useOrderedCoins(CATALOG));
    await waitFor(() => expect(result.current.orderedCoins).toHaveLength(3));

    act(() => {
      result.current.reorderVisible(0, 2, ["BTC", "ETH", "SOL"]); // -> ETH, SOL, BTC with a fresh updatedAt
    });

    const stalePayload = buildOrderPayload(["SOL", "ETH", "BTC"], 1);
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: ORDER_STORAGE_KEY, newValue: JSON.stringify(stalePayload) }),
      );
    });

    expect(result.current.orderedCoins.map((c) => c.code)).toEqual(["ETH", "SOL", "BTC"]);
  });
});
