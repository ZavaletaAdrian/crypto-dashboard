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
