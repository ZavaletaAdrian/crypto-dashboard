import type { Route } from "./+types/home";
import { getRatesPayloadForRead } from "~/services/rates-payload.server";
import { useRatesPolling } from "~/hooks/useRatesPolling";
import { CryptoGrid } from "~/components/CryptoGrid";
import { StalenessBadge } from "~/components/StalenessBadge";
import { RefreshButton } from "~/components/RefreshButton";

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

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Crypto Dashboard</h1>
        <div className="flex items-center gap-3">
          <StalenessBadge tier={tier} ageMs={ageMs} />
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

      <CryptoGrid coins={coins} rates={rates} />
    </main>
  );
}
