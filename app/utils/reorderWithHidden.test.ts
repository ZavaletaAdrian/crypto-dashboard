import { describe, expect, it } from "vitest";
import { reorderWithHidden } from "./reorderWithHidden";

describe("reorderWithHidden", () => {
  it("reorders normally when nothing is hidden (visible === full)", () => {
    const full = ["A", "B", "C"];
    const result = reorderWithHidden(full, full, 0, 2);
    expect(result).toEqual(["B", "C", "A"]);
  });

  it("keeps hidden coins at their exact absolute slot when a visible coin is dragged past them", () => {
    // B and D are hidden by a filter; only A, C, E are visible.
    const full = ["A", "B", "C", "D", "E"];
    const visible = ["A", "C", "E"];

    // Drag E (visible index 2) to the front (visible index 0): visible becomes [E, A, C].
    const result = reorderWithHidden(full, visible, 2, 0);

    expect(result).toEqual(["E", "B", "A", "D", "C"]);
    // B and D never moved from their original absolute index.
    expect(result[1]).toBe("B");
    expect(result[3]).toBe("D");
  });

  it("is a no-op when from and to are the same visible index", () => {
    const full = ["A", "B", "C"];
    const result = reorderWithHidden(full, ["A", "C"], 0, 0);
    expect(result).toBe(full);
  });

  it("handles dropping at the last visible position", () => {
    const full = ["A", "B", "C", "D"];
    const visible = ["A", "C", "D"];
    // Drag A (visible index 0) to the end (visible index 2): visible becomes [C, D, A],
    // poured back into slots [0, 2, 3] (where A, C, D originally sat) — B (hidden) untouched.
    const result = reorderWithHidden(full, visible, 0, 2);
    expect(result).toEqual(["C", "B", "D", "A"]);
    expect(result[1]).toBe("B");
  });

  it("handles a single visible coin sandwiched between two hidden ones", () => {
    const full = ["A", "B", "C"];
    const visible = ["B"];
    // Only one visible item — no other visible index to move to or from.
    const result = reorderWithHidden(full, visible, 0, 0);
    expect(result).toBe(full);
  });
});
