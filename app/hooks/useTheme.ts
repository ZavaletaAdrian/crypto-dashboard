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

function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // Storage disabled or quota exceeded — the toggle still works for the
    // rest of this session via the DOM class, it just won't survive reload.
  }
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
    const initial = stored ?? getSystemTheme();
    if (stored) hasExplicitChoice.current = true;
    document.documentElement.classList.toggle("dark", initial === "dark");
    setTheme(initial);
    setMounted(true);
  }, []);

  // Applies the DOM class and persistence synchronously in the same click
  // handler (not a separate effect) — an effect-based write can race with
  // an immediate reload/navigation right after the click, briefly leaving
  // the icon (React state) desynced from the actual page theme (DOM class)
  // until the effect runs.
  //
  // Derives `next` from the live DOM class rather than the closed-over
  // `theme` state: two clicks queued before React commits a re-render would
  // otherwise both read the same stale `theme` value and compute the same
  // `next`, silently cancelling one of the toggles out. The DOM class is
  // mutated synchronously within this same handler, so it's already correct
  // by the time a second rapid click re-enters — no dependency on React's
  // render cycle at all, so toggleTheme can stay referentially stable too.
  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    hasExplicitChoice.current = true;
    document.documentElement.classList.toggle("dark", next === "dark");
    persistTheme(next);
    setTheme(next);
  }, []);

  return { theme, mounted, toggleTheme };
}
