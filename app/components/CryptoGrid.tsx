import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CryptoCard } from "./CryptoCard";
import type { Coin, CoinRateMap } from "~/types/coin";

interface CryptoGridProps {
  /** Already the ordered + currently-visible (filtered) subset. */
  coins: Coin[];
  rates: CoinRateMap;
  priceHistoryByCode?: Partial<Record<string, number[]>>;
  onReorder: (fromIndex: number, toIndex: number, visibleCodes: string[]) => void;
}

export function CryptoGrid({ coins, rates, priceHistoryByCode = {}, onReorder }: CryptoGridProps) {
  const visibleCodes = coins.map((coin) => coin.code);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = visibleCodes.indexOf(String(active.id));
    const toIndex = visibleCodes.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;
    onReorder(fromIndex, toIndex, visibleCodes);
  }

  return (
    // A stable `id` makes dnd-kit's internal `useUniqueId` return it verbatim
    // instead of falling back to a module-level counter — that counter can
    // reach a different value on the server render vs. the client's first
    // render (order/count of other useUniqueId consumers isn't guaranteed to
    // match), which produced a real hydration mismatch on every card's
    // `aria-describedby` (caught via the impeccable audit + browser console).
    <DndContext id="crypto-grid" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleCodes} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coins.map((coin) => (
            <SortableCryptoCard
              key={coin.code}
              coin={coin}
              rate={rates[coin.code]}
              priceHistory={priceHistoryByCode[coin.code] ?? []}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableCryptoCardProps {
  coin: Coin;
  rate: CoinRateMap[string];
  priceHistory: number[];
}

function SortableCryptoCard({ coin, rate, priceHistory }: SortableCryptoCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: coin.code,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} data-testid={`sortable-item-${coin.code}`}>
      <CryptoCard
        coin={coin}
        rate={rate}
        priceHistory={priceHistory}
        dragHandleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </div>
  );
}
