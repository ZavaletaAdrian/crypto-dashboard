// Status/trend signal colors. Each resolves to a CSS custom property
// (defined per-mode in app.css) rather than a fixed hex: the same three
// hues need different lightness in light vs. dark mode to each clear a
// 4.5:1 contrast ratio against their own card surface — a fixed value
// tuned for one mode fails WCAG AA in the other.
//
// Single source of truth: Sparkline and CryptoCard both derive their trend
// colors from here so the two can't drift apart if the palette ever changes.
export const STATUS_COLOR = {
  good: "var(--status-good)",
  critical: "var(--status-critical)",
  muted: "var(--status-muted)",
} as const;
