import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./Sparkline";

describe("Sparkline", () => {
  it("renders an empty (hidden) svg when there isn't enough data yet", () => {
    const { container } = render(<Sparkline values={[100]} trend="flat" />);
    expect(container.querySelector("path")).not.toBeInTheDocument();
  });

  it("renders a labeled trend line once there are at least two points", () => {
    const { getByRole } = render(<Sparkline values={[100, 110, 105]} trend="up" />);
    expect(getByRole("img", { name: "Recent price trend: up" })).toBeInTheDocument();
  });

  it("draws exactly one line and one end-marker dot", () => {
    const { container } = render(<Sparkline values={[100, 90, 95]} trend="down" />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });

  it("renders a flat series (all equal values) as a centered line, not pegged to an edge", () => {
    const { container } = render(<Sparkline values={[100, 100, 100]} trend="flat" height={24} />);
    const path = container.querySelector("path");
    // Every point should be at the vertical center (height / 2), not at the
    // bottom edge where the old (min - min) / range formula would peg it.
    expect(path?.getAttribute("d")).toBe("M0.00,12.00 L32.00,12.00 L64.00,12.00");
  });

  it("keeps the end marker fully inside the viewBox even at the extremes of the range", () => {
    const { container } = render(<Sparkline values={[0, 100]} trend="up" height={24} />);
    const circle = container.querySelector("circle");
    const cy = Number(circle?.getAttribute("cy"));
    const r = Number(circle?.getAttribute("r"));
    expect(cy - r).toBeGreaterThanOrEqual(0);
    expect(cy + r).toBeLessThanOrEqual(24);
  });
});
