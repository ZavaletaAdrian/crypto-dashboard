import { useCallback, useEffect, useRef, useState } from "react";

export type Theme = "light" | "dark";

function readStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    // Storage disabled (e.g. some private-browsing modes).
    return null;
  }
}

function getSystemTheme(): Theme {
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
  // Only true once the user has actually chosen (or a prior choice was
  // already stored) — a system-derived default must NOT get persisted,
  // or a first-time visitor's OS preference silently becomes a permanent
  // stored choice and stops following future OS-level changes.
  const hasExplicitChoice = useRef(false);

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      hasExplicitChoice.current = true;
      setTheme(stored);
    } else {
      setTheme(getSystemTheme());
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (!hasExplicitChoice.current) return;
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // Storage disabled or quota exceeded — the toggle still works for the
      // rest of this session via the DOM class, it just won't survive reload.
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    hasExplicitChoice.current = true;
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, mounted, toggleTheme };
}
