import { useState } from "react";
import type { Route } from "./+types/home";
import { getRatesPayloadForRead } from "~/services/rates-payload.server";
import { useRatesPolling } from "~/hooks/useRatesPolling";
import { useOrderedCoins } from "~/hooks/useOrderedCoins";
import { useFilteredVisibleCoins } from "~/hooks/useFilteredVisibleCoins";
import { CryptoGrid } from "~/components/CryptoGrid";
import { StalenessBadge } from "~/components/StalenessBadge";
import { RefreshButton } from "~/components/RefreshButton";
import { FilterInput } from "~/components/FilterInput";
import { EmptyState } from "~/components/EmptyState";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crypto Dashboard" },
    { name: "description", content: "Live cryptocurrency exchange rates" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  return getRatesPayloadForRead();
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { coins, rates, ageMs, tier, lastError, refresh, refreshState, retryAvailableAt } =
    useRatesPolling(loaderData);
  const { orderedCoins, reorderVisible } = useOrderedCoins(coins);
  const [filterQuery, setFilterQuery] = useState("");
  const visibleCoins = useFilteredVisibleCoins(orderedCoins, filterQuery);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Crypto Dashboard</h1>
        <div className="flex items-center gap-3">
          <StalenessBadge tier={tier} ageMs={ageMs} hasError={Boolean(lastError)} />
          <RefreshButton
            onRefresh={refresh}
            isRefreshing={refreshState === "refreshing"}
            retryAvailableAt={retryAvailableAt}
          />
        </div>
      </header>

      {tier === "never" && !lastError && (
        <p className="mb-4 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          Loading first rates…
        </p>
      )}
      {tier === "never" && lastError && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
          Live rates are temporarily unavailable — showing the coin list only. Reconnecting automatically.
        </p>
      )}
      {tier === "stale" && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
          Live rates are temporarily unavailable — showing last known data. Reconnecting automatically.
        </p>
      )}

      <div className="mb-4">
        <FilterInput value={filterQuery} onChange={setFilterQuery} />
      </div>

      {visibleCoins.length === 0 ? (
        <EmptyState message={`No coins match "${filterQuery.trim()}".`} />
      ) : (
        <CryptoGrid coins={visibleCoins} rates={rates} onReorder={reorderVisible} />
      )}
    </main>
  );
}
