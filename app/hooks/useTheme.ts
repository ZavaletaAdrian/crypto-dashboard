import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem("theme");
  } catch {
    // Storage disabled (e.g. some private-browsing modes) — fall back to matchMedia below.
  }
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export interface UseThemeResult {
  theme: Theme;
  /** False until after mount — reading localStorage/matchMedia during SSR
   *  would produce a value the server doesn't have, causing a hydration
   *  mismatch; callers should render a neutral default until this is true. */
  mounted: boolean;
  toggleTheme: () => void;
}

/**
 * Owns the theme state, its DOM side effect (toggling `.dark` on
 * `<html>`), and its persistence — kept out of ThemeToggle so that
 * component stays purely presentational, matching this repo's convention
 * of cross-cutting state living in a hook (see useOrderedCoins).
 */
export function useTheme(): UseThemeResult {
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

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, mounted, toggleTheme };
}
