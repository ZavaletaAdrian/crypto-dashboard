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
});
