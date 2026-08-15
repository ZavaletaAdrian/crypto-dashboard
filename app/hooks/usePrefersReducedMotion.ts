import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * False during SSR and until mount (matching the server's "no preference
 * known" state), then reflects the OS setting and stays live if the user
 * changes it while the tab is open — unlike useTheme, this is never a user
 * choice to persist, only a system signal to follow.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);

    // Safari <14 only has the deprecated addListener/removeListener pair;
    // addEventListener there either doesn't exist or silently no-ops.
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReduced;
}
