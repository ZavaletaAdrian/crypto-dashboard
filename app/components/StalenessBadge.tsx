import type { StalenessTier } from "~/types/coin";

interface StalenessBadgeProps {
  tier: StalenessTier;
  ageMs: number | null;
}

const TIER_STYLES: Record<StalenessTier, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  delayed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  stale: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  never: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

function formatAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

function label(tier: StalenessTier, ageMs: number | null): string {
  switch (tier) {
    case "live":
      return "Live";
    case "delayed":
      return `Delayed, ${formatAge(ageMs ?? 0)}`;
    case "stale":
      return `Stale — ${formatAge(ageMs ?? 0)}`;
    case "never":
      return "Loading…";
  }
}

export function StalenessBadge({ tier, ageMs }: StalenessBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TIER_STYLES[tier]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label(tier, ageMs)}
    </span>
  );
}
