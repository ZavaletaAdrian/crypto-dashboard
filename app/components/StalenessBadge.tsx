import type { StalenessTier } from "~/types/coin";

interface StalenessBadgeProps {
  tier: StalenessTier;
  ageMs: number | null;
  /** True once at least one fetch attempt has failed — distinguishes "still loading" from "erroring." */
  hasError?: boolean;
}

const TIER_STYLES: Record<StalenessTier, string> = {
  live: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  delayed: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  stale: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  never: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

const NEVER_TIER_STYLE_WITH_ERROR = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

function formatAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

function label(tier: StalenessTier, ageMs: number | null, hasError: boolean): string {
  switch (tier) {
    case "live":
      return "Live";
    case "delayed":
      return `Delayed, ${formatAge(ageMs ?? 0)}`;
    case "stale":
      return `Stale — ${formatAge(ageMs ?? 0)}`;
    case "never":
      return hasError ? "Unavailable" : "Loading…";
  }
}

export function StalenessBadge({ tier, ageMs, hasError = false }: StalenessBadgeProps) {
  const style = tier === "never" && hasError ? NEVER_TIER_STYLE_WITH_ERROR : TIER_STYLES[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label(tier, ageMs, hasError)}
    </span>
  );
}
