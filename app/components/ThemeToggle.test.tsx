import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("defaults to light (no stored preference, matchMedia not mocked to dark) and toggles to dark on click", async () => {
    render(<ThemeToggle />);

    // Let the mount effect resolve the real (post-mount) theme.
    await screen.findByLabelText("Switch to dark mode");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.click(screen.getByLabelText("Switch to dark mode"));

    expect(await screen.findByLabelText("Switch to light mode")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("respects a previously stored preference on mount", async () => {
    window.localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);

    await screen.findByLabelText("Switch to light mode");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles back to light and persists it", async () => {
    window.localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    await screen.findByLabelText("Switch to light mode");

    fireEvent.click(screen.getByLabelText("Switch to light mode"));

    expect(await screen.findByLabelText("Switch to dark mode")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
