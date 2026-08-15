// Status palette (fixed, never themed — see the dataviz skill's palette.md).
// Single source of truth: Sparkline and CryptoCard both derive their trend
// colors from here so the two can't drift apart if the palette ever changes.
export const STATUS_COLOR_HEX = {
  good: "#0ca30c",
  critical: "#d03b3b",
  muted: "#898781",
} as const;
