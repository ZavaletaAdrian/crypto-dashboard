import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useTheme } from "./useTheme";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("useTheme", () => {
  it("defaults to light when there's no stored preference and matchMedia doesn't match dark", async () => {
    const { result } = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("respects a previously stored preference", async () => {
    window.localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.mounted).toBe(true));

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles the theme, updates the DOM class, and persists the choice", async () => {
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.mounted).toBe(true));

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
