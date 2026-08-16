import { useState } from "react";
import type { Route } from "./+types/home";
import { getRatesPayloadForRead } from "~/services/rates-payload.server";
import { useRatesPolling } from "~/hooks/useRatesPolling";
import { useOrderedCoins } from "~/hooks/useOrderedCoins";
import { useFilteredVisibleCoins } from "~/hooks/useFilteredVisibleCoins";
import { usePriceHistory } from "~/hooks/usePriceHistory";
import { useTheme } from "~/hooks/useTheme";
import { CryptoGrid } from "~/components/CryptoGrid";
import { StalenessBadge } from "~/components/StalenessBadge";
import { RefreshButton } from "~/components/RefreshButton";
import { FilterInput } from "~/components/FilterInput";
import { EmptyState } from "~/components/EmptyState";
import { ThemeToggle } from "~/components/ThemeToggle";

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
  const priceHistoryByCode = usePriceHistory(rates);
  const { theme, mounted: themeMounted, toggleTheme } = useTheme();
  const [filterQuery, setFilterQuery] = useState("");
  const visibleCoins = useFilteredVisibleCoins(orderedCoins, filterQuery);

  return (
    <div className="min-h-screen bg-[var(--panel-page)]">
      <header className="sticky top-0 z-10 border-b border-[var(--panel-border)] bg-[var(--panel-page)]/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--panel-text-primary)]">Crypto Dashboard</h1>
            <p className="text-sm text-[var(--panel-text-secondary)]">Live exchange rates via Coinbase</p>
          </div>
          <div className="flex items-center gap-3">
            <StalenessBadge tier={tier} ageMs={ageMs} hasError={Boolean(lastError)} />
            <RefreshButton
              onRefresh={refresh}
              isRefreshing={refreshState === "refreshing"}
              retryAvailableAt={retryAvailableAt}
            />
            <ThemeToggle theme={theme} mounted={themeMounted} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {tier === "never" && !lastError && (
          <p className="mb-4 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-chassis)] px-3 py-2 text-sm text-[var(--panel-text-secondary)]">
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

        <div className="mb-5">
          <FilterInput value={filterQuery} onChange={setFilterQuery} />
        </div>

        {visibleCoins.length === 0 ? (
          <EmptyState message={`No coins match "${filterQuery.trim()}".`} />
        ) : (
          <CryptoGrid
            coins={visibleCoins}
            rates={rates}
            priceHistoryByCode={priceHistoryByCode}
            onReorder={reorderVisible}
          />
        )}
      </main>
    </div>
  );
}
