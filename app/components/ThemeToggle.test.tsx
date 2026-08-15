import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

// Theme persistence/matchMedia-fallback logic lives in useTheme and is
// covered by useTheme.test.ts — this only verifies the presentational
// component renders the given props correctly and calls onToggle.

describe("ThemeToggle", () => {
  it("is disabled with a neutral label before mounted", () => {
    render(<ThemeToggle theme="light" mounted={false} onToggle={() => {}} />);
    const button = screen.getByLabelText("Toggle theme");
    expect(button).toBeDisabled();
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
