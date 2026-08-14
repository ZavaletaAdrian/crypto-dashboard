import { arrayMove } from "@dnd-kit/sortable";

/**
 * Translates a drag-and-drop move made against the currently *visible*
 * subset of coins into the full underlying order, without disturbing the
 * absolute position of any coin currently hidden by a filter (T5).
 *
 * Precondition: every code in `visibleOrder` must also appear in `fullOrder`
 * (guaranteed by construction — visibleOrder is always a filtered subset).
 */
export function reorderWithHidden(
  fullOrder: string[],
  visibleOrder: string[],
  fromVisibleIndex: number,
  toVisibleIndex: number,
): string[] {
  if (fromVisibleIndex === toVisibleIndex) return fullOrder;

  const visibleSet = new Set(visibleOrder);
  const visibleSlots = fullOrder.reduce<number[]>((slots, code, index) => {
    if (visibleSet.has(code)) slots.push(index);
    return slots;
  }, []);

  const newVisibleOrder = arrayMove(visibleOrder, fromVisibleIndex, toVisibleIndex);

  const newFullOrder = [...fullOrder];
  visibleSlots.forEach((slot, i) => {
    newFullOrder[slot] = newVisibleOrder[i];
  });
  return newFullOrder;
}
