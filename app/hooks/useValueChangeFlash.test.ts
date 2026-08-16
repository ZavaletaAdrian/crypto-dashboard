import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useValueChangeFlash } from "./useValueChangeFlash";

describe("useValueChangeFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is false on mount", () => {
    const { result } = renderHook(() => useValueChangeFlash("$100.00"));
    expect(result.current).toBe(false);
  });

  it("flashes true briefly after the value changes, then false again", () => {
    const { result, rerender } = renderHook(({ value }) => useValueChangeFlash(value), {
      initialProps: { value: "$100.00" },
    });
    expect(result.current).toBe(false);

    rerender({ value: "$101.00" });
    expect(result.current).toBe(true);

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current).toBe(false);
  });

  it("does not flash when re-rendered with the same value", () => {
    const { result, rerender } = renderHook(({ value }) => useValueChangeFlash(value), {
      initialProps: { value: "$100.00" },
    });
    rerender({ value: "$100.00" });
    expect(result.current).toBe(false);
  });
});
