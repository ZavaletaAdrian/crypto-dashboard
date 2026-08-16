import { Moon, Sun, SunMoon } from "lucide-react";
import type { Theme } from "~/hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  /** False until after mount — see useTheme's doc comment. Disables the
   *  button during that window so a fast click can't toggle in the wrong
   *  direction relative to the theme the pre-paint script already applied. */
  mounted: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ theme, mounted, onToggle }: ThemeToggleProps) {
  const label = !mounted ? "Toggle theme" : theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!mounted}
      aria-label={label}
      aria-pressed={mounted ? theme === "dark" : undefined}
      className="inline-flex items-center justify-center rounded-lg border border-[var(--panel-border)] bg-[var(--panel-chassis)] p-2 text-[var(--panel-text-secondary)] hover:border-[var(--panel-amber)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-amber)] disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors"
    >
      {!mounted ? (
        <SunMoon className="h-4 w-4" aria-hidden="true" />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
