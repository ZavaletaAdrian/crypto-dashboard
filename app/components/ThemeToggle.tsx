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
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus-visible:outline-gray-100"
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
