import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

// Theme persistence/matchMedia-fallback logic is covered by useTheme.test.ts —
// this only verifies ThemeToggle renders and wires the hook's result correctly.

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
});

describe("ThemeToggle", () => {
  it("renders the light-mode state and toggles to dark on click", async () => {
    render(<ThemeToggle />);

    const button = await screen.findByLabelText("Switch to dark mode");
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    const toggled = await screen.findByLabelText("Switch to light mode");
    expect(toggled).toHaveAttribute("aria-pressed", "true");
  });
});
