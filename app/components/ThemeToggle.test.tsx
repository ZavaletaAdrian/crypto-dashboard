import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

// Theme persistence/matchMedia-fallback logic lives in useTheme and is
// covered by useTheme.test.ts — this only verifies the presentational
// component renders the given props correctly and calls onToggle.

describe("ThemeToggle", () => {
  it("is disabled with a neutral label and icon before mounted", () => {
    // Regression test: the icon must stay neutral (not Sun or Moon) until
    // mounted, matching the neutral label — otherwise it implies a theme
    // direction before the client-only value (localStorage/matchMedia) is
    // known, which is exactly the hydration-mismatch risk mounted exists to avoid.
    const { container } = render(<ThemeToggle theme="light" mounted={false} onToggle={() => {}} />);
    const button = screen.getByLabelText("Toggle theme");
    expect(button).toBeDisabled();
    expect(container.querySelector(".lucide-sun-moon")).not.toBeNull();
    expect(container.querySelector(".lucide-sun")).toBeNull();
    expect(container.querySelector(".lucide-moon")).toBeNull();
  });

  it("shows the light-mode state once mounted and calls onToggle on click", () => {
    const onToggle = vi.fn();
    render(<ThemeToggle theme="light" mounted onToggle={onToggle} />);

    const button = screen.getByLabelText("Switch to dark mode");
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("shows the dark-mode state once mounted", () => {
    render(<ThemeToggle theme="dark" mounted onToggle={() => {}} />);
    const button = screen.getByLabelText("Switch to light mode");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
