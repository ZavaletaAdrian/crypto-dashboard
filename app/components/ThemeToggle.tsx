import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem("theme");
  } catch {
    // Storage disabled (e.g. some private-browsing modes) — fall back to matchMedia below.
  }
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * The actual page theme is already set before first paint by the blocking
 * inline script in root.tsx (no flash of the wrong theme for the page
 * itself). This component only needs to know the theme to pick its OWN
 * icon, and it can't know that safely until after mount — reading
 * localStorage/matchMedia during SSR would produce a value the server
 * doesn't have, causing a hydration mismatch on the icon. Rendering a
 * neutral default until mounted, then correcting once, avoids that at the
 * cost of one harmless icon swap on first paint.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // Storage disabled or quota exceeded — the toggle still works for the
      // rest of this session via the DOM class, it just won't survive reload.
    }
  }, [theme, mounted]);

  const label = !mounted ? "Toggle theme" : theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label={label}
      className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
