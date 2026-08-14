import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StalenessBadge } from "./StalenessBadge";

describe("StalenessBadge", () => {
  it("shows 'Live' for the live tier", () => {
    render(<StalenessBadge tier="live" ageMs={2000} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows the age for delayed and stale tiers", () => {
    const { rerender } = render(<StalenessBadge tier="delayed" ageMs={15_000} />);
    expect(screen.getByText("Delayed, 15s ago")).toBeInTheDocument();

    rerender(<StalenessBadge tier="stale" ageMs={90_000} />);
    expect(screen.getByText("Stale — 1m ago")).toBeInTheDocument();
  });

  it("shows 'Loading…' for the never tier with no error yet", () => {
    render(<StalenessBadge tier="never" ageMs={null} />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows 'Unavailable' instead of 'Loading…' once a fetch has actually failed", () => {
    render(<StalenessBadge tier="never" ageMs={null} hasError />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });
});
