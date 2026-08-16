import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useValueChangeFlash } from "./useValueChangeFlash";

describe("useValueChangeFlash", () => {
  it("is false on mount", () => {
    const { result } = renderHook(() => useValueChangeFlash("$100.00"));
    expect(result.current).toBe(false);
  });

  it("flashes true briefly after the value changes, then false again", async () => {
    const { result, rerender } = renderHook(({ value }) => useValueChangeFlash(value), {
      initialProps: { value: "$100.00" },
    });
    expect(result.current).toBe(false);

    rerender({ value: "$101.00" });
    expect(result.current).toBe(true);

    await waitFor(() => expect(result.current).toBe(false));
  });

  it("does not flash when re-rendered with the same value", () => {
    const { result, rerender } = renderHook(({ value }) => useValueChangeFlash(value), {
      initialProps: { value: "$100.00" },
    });
    rerender({ value: "$100.00" });
    expect(result.current).toBe(false);
  });
});
