import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement ResizeObserver; @dnd-kit/core uses it to measure
// draggable/droppable rects. A no-op stub is enough for component tests that
// don't depend on real layout (those mock getBoundingClientRect directly).
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// jsdom doesn't implement matchMedia either. Defaults to "no match" (light
// mode) — tests that care about a specific query result mock it themselves.
if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
