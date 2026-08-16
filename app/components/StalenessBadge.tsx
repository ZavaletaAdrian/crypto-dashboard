import type { StalenessTier } from "~/types/coin";

interface StalenessBadgeProps {
  tier: StalenessTier;
  ageMs: number | null;
  /** True once at least one fetch attempt has failed — distinguishes "still loading" from "erroring." */
  hasError?: boolean;
}

// Lamp color per tier — the dot's own text color, which also drives its glow
// via `shadow-[0_0_5px_currentColor]` below. Same semantic hues as before
// (Tailwind's own green/amber/red/gray), now read as a panel indicator lamp
// rather than a colored pill.
const LAMP_COLOR: Record<StalenessTier, string> = {
  live: "text-green-500 dark:text-green-400",
  delayed: "text-amber-500 dark:text-amber-400",
  stale: "text-red-500 dark:text-red-400",
  never: "text-gray-400 dark:text-gray-500",
};

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
  const lampColor = tier === "never" && hasError ? LAMP_COLOR.stale : LAMP_COLOR[tier];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-page)] px-2.5 py-1 text-xs font-medium text-[var(--panel-text-secondary)]">
      {/* The lamp itself: a recessed bezel ring around a lit dot. Color-only
          transition (not spatial), so it stays un-gated by motion-safe — a
          state-changing color swap is exactly what reduced motion asks apps
          to keep. */}
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] transition-colors duration-200 ${lampColor}`}
        aria-hidden="true"
      />
      {label(tier, ageMs, hasError)}
    </span>
  );
}
