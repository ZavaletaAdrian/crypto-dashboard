import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CryptoGrid } from "./CryptoGrid";
import type { Coin, CoinRateMap } from "~/types/coin";

const COINS: Coin[] = [
  { code: "BTC", name: "Bitcoin" },
  { code: "ETH", name: "Ethereum" },
  { code: "SOL", name: "Solana" },
];

const RATES: CoinRateMap = {
  BTC: { usd: 60000, btc: 1 },
  ETH: { usd: 2000, btc: 0.03 },
  SOL: { usd: 100, btc: 0.0016 },
};

function makeRect(index: number): DOMRect {
  const width = 200;
  const height = 150;
  const x = index * width;
  return {
    x,
    y: 0,
    width,
    height,
    top: 0,
    left: x,
    right: x + width,
    bottom: height,
    toJSON() {
      return this;
    },
  } as DOMRect;
}

// Lays the three cards out in a single row so closestCenter has a
// deterministic, discriminating layout to collide against — jsdom itself
// has no real layout engine and returns an all-zero rect for every element.
const RECTS: Record<string, DOMRect> = {
  BTC: makeRect(0),
  ETH: makeRect(1),
  SOL: makeRect(2),
};

describe("CryptoGrid drag-and-drop", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const item = this.closest('[data-testid^="sortable-item-"]') as HTMLElement | null;
      const code = item?.dataset.testid?.replace("sortable-item-", "");
      return code && RECTS[code] ? RECTS[code] : makeRect(0);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onReorder with the from/to visible indices when a card is dragged onto another", () => {
    const onReorder = vi.fn();
    render(<CryptoGrid coins={COINS} rates={RATES} onReorder={onReorder} />);

    const btcHandle = screen.getByLabelText("Reorder Bitcoin");

    // BTC starts centered at x=100; dragging it to x=500 lands on SOL's
    // center (x=400..600), which should resolve as the closest collision.
    fireEvent.pointerDown(btcHandle, { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 75 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 500, clientY: 75 });
    fireEvent.pointerUp(document, { pointerId: 1, clientX: 500, clientY: 75 });

    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith(0, 2, ["BTC", "ETH", "SOL"]);
  });

  it("does not call onReorder when a card is picked up and dropped back in place", () => {
    const onReorder = vi.fn();
    render(<CryptoGrid coins={COINS} rates={RATES} onReorder={onReorder} />);

    const btcHandle = screen.getByLabelText("Reorder Bitcoin");

    fireEvent.pointerDown(btcHandle, { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 75 });
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 105, clientY: 75 });
    fireEvent.pointerUp(document, { pointerId: 1, clientX: 105, clientY: 75 });

    expect(onReorder).not.toHaveBeenCalled();
  });
});
