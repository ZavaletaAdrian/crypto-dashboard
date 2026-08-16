---
name: Crypto Dashboard
description: A Nixie-Tube Instrument Panel for live crypto exchange rates — glowing digit-tube price readouts on a brushed-steel chassis
colors:
  panel-page: "#fafafa"
  panel-chassis: "#ffffff"
  panel-border: "#dfe2e6"
  panel-text-primary: "#0f1115"
  panel-text-secondary: "#6b7076"
  panel-amber: "#9a4d00"
  status-good: "#15803d"
  status-critical: "#d03b3b"
  status-muted: "#676561"
  lamp-live: "#22c55e"
  lamp-delayed: "#f59e0b"
  lamp-stale: "#ef4444"
  lamp-never: "#9ca3af"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  digit-readout:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "1.25rem"
    fontWeight: 600
    fontFeature: "tabular-nums"
rounded:
  lg: "0.5rem"
  full: "9999px"
spacing:
  xs: "0.375rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  card:
    backgroundColor: "{colors.panel-chassis}"
    textColor: "{colors.panel-text-primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  button-refresh:
    backgroundColor: "{colors.panel-chassis}"
    textColor: "{colors.panel-text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  button-icon:
    backgroundColor: "{colors.panel-chassis}"
    textColor: "{colors.panel-text-secondary}"
    rounded: "{rounded.lg}"
    padding: "8px"
  panel-fastener:
    backgroundColor: "transparent"
    textColor: "{colors.panel-text-secondary}"
    rounded: "{rounded.full}"
    padding: "10px"
  badge-staleness:
    backgroundColor: "{colors.panel-page}"
    textColor: "{colors.panel-text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  input-filter:
    backgroundColor: "{colors.panel-chassis}"
    textColor: "{colors.panel-text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "6px 12px 6px 36px"
---

# Design System: Crypto Dashboard

## Overview

**Creative North Star: "The Nixie-Tube Instrument Panel"**

This build supersedes "The Instrument Panel" (the prior grayscale, no-accent world). The thesis held — the numbers are still the interface — but the execution committed to a single physical metaphor: each price is a glowing digit-tube reading on a brushed-steel chassis, not a flat number in a bordered card. One warm amber is the system's single committed signal — the instrument's own light source — rendered as tabular-mono digits that go from an unlit, muted tube (no rate yet) to a lit, glowing one (a real reading in hand) the instant data arrives.

The chassis material is genuinely dual-scene, not a single palette with a dark-mode filter over it. Dark mode is the native scene: a dim room where a two-layer text-shadow (a near-opaque core plus a soft wide halo) makes the amber price read as an actual light source, and the card itself gets a real inset-shadow chassis depth (a bright top lip, a soft inner shadow) against a near-black floor. Light mode is not that scene inverted — it follows real trading-platform convention (Binance-style): crisp near-white throughout, hierarchy carried by hairline dividers and typography rather than a page-vs-card background split, and the amber token retunes to a deep burnt tone with its glow tokens literally set to `transparent`, because a daylight scene cannot sustain a dominant glow the way a dim room can. Same object, two honest ambient-light readings of it.

Status/trend meaning (up, down, flat, live, delayed, stale) still lives entirely outside the amber channel, in a separate green/red/gray vocabulary — amber never doubles as "this went up," and status color never doubles as "this control is interactive." The system keeps the prior world's core discipline (color always carries a specific meaning, never decoration for its own sake) while adding exactly one identity commitment the old grayscale world explicitly refused: a signature accent that says "the instrument is on."

**Key Characteristics:**
- One committed accent (amber) marks affordance and "a real reading exists"; it never carries market-direction or freshness meaning — those stay in a separate status palette.
- Dark mode is the hero scene for the amber glow (two-layer text-shadow); light mode is a genuinely different, glow-off reading of the same object, not an inversion.
- The digit-readout tube is typography-only until a `--lit` modifier is applied on a truthy rate — an unlit tube is never mistaken for "a reading that was never taken."
- Depth is now ambient (inset chassis shadows on the card and drag-handle-as-fastener), not interactive-only hover feedback the way the prior world's single hover-shadow was.
- Radius language simplified to two steps: `rounded-lg` for every container/control, `rounded-full` for anything meant to read as a dot, mount, or lamp.

## Colors

The palette is still overwhelmingly neutral, with exactly one committed accent (amber) plus a small, fixed status vocabulary carried over from the prior world.

### Primary
- **Panel Amber** (`#9a4d00` light / `#ffa726` dark): the instrument's own signature hue — lit digit-tube price readouts, hover borders on cards/buttons/inputs (`/40` or `/60` opacity), and every `:focus-visible` outline. It is the one place this system spends a "brand" color, and it is spent consistently everywhere something is interactive or actively displaying real data — never on trend or freshness state.

### Neutral
- **Panel Page** (`#fafafa` light / `#0a0b0d` dark): the page backdrop and sticky header fill.
- **Panel Chassis** (`#ffffff` light / `#17191d` dark): card, button, and input surface — in light mode this sits only one step off Panel Page (the Binance-style "crisp near-white" read); in dark mode it's a clearly distinct, lighter-than-page chassis material.
- **Panel Border** (`#dfe2e6` light / `#2b2e34` dark): the one hairline used for every card, control, and divider border.
- **Panel Text Primary** (`#0f1115` light / `#e8e9eb` dark): headings, the page `<h1>`, card names.
- **Panel Text Secondary** (`#6b7076` light / `#9a9ea6` dark): symbols, BTC sub-price line, badge text, placeholder text, unlit digit tubes.

### Status (trend + freshness — unchanged in role from the prior world)
- **Status Good** (`#15803d` light / `#0ca30c` dark): upward trend only — sparkline end-dot, delta-chip icon/text.
- **Status Critical** (`#d03b3b` light / `#ef4444` dark): downward trend only.
- **Status Muted** (`#676561` light / `#898781` dark): flat trend, and the sparkline's own line color regardless of direction (see the Muted-Line Rule under Components).
- **Staleness lamp colors** (Tailwind's literal `green-500`/`amber-500`/`red-500`/`gray-400`, `-400`/`-500` in dark): the StalenessBadge's four-tier indicator dot. These are a separate literal set from `STATUS_COLOR` above, scoped to that one component — see the Do's and Don'ts note on why this isn't promoted into a second shared token source.

### Named Rules
**The Single-Amber Rule.** Exactly one warm accent exists in this system. It marks "this is interactive" (hover, focus) and "this is a live reading" (a lit digit tube). It never marks trend direction or freshness — those stay in the separate status/lamp vocabulary above, so a glance can't confuse "the instrument is on" with "the market moved."

**The Native-Scene Rule.** The amber glow is a dark-mode-native phenomenon: `--panel-amber-glow` and `--panel-amber-glow-core` are literally `transparent` in `:root`. Light mode is a deliberately different, glow-off reading of the same instrument (Binance-style crisp daylight), never a dimmed copy of the dark-mode value.

**The Muted-Line Rule** (carried forward). A trend sparkline's line is always the muted status hue; only its terminal point ever takes the direction-specific status color.

## Typography

**Sans Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Mono Font:** the platform monospace stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`) — no custom mono face is loaded

**Character:** Inter still carries every non-numeric label and heading; mono is reserved for anything that is literally a reading off the instrument — the digit-tube price, the BTC sub-line, coin codes, badge text. The split is functional, not decorative: tabular-nums matters wherever a column of numbers needs to line up, and nowhere else.

### Hierarchy
- **Title** (600, 1.25rem/20px, Inter): the page `<h1>` only.
- **Digit Readout** (600, 1.25rem/20px, mono, tabular-nums): each card's headline USD price. It shares the Title tier's exact size and weight but not its font — the price is instrument data, rendered in the mono face, not prose set at the same rank as a heading.
- **Headline** (600, 1rem/16px, Inter): each card's coin name (`<h2>`) — one step down from Title/Digit Readout, a real shift from the prior world where card name and price shared one size.
- **Body** (400, 0.875rem/14px, Inter): the page subtitle, button labels, filter input text, banner/empty-state copy.
- **Label** (500, 0.75rem/12px, mono, letter-spacing 0.01em): coin symbol (uppercase), BTC sub-price, badge text, the delta chip's "recent" caption.

### Named Rules
**The Instrument-Reading Rule.** Anything that is a live numeric reading off the dashboard (the USD price, the BTC rate, the coin code) renders in the mono face with tabular-nums. Anything that is prose or a heading (page title, coin name, button labels) renders in Inter. A component never mixes the two within a single value.

## Layout

Unchanged from the prior world's spatial grammar: a single centered column, `max-w-6xl` (1152px), 24px (`p-6`) outer padding, a sticky translucent header (85% opacity page-fill, backdrop-blur, hairline bottom border) above the filter control and the card grid. The grid is responsive by column count — 1 column by default, 2 at `sm` (640px), 3 at `lg` (1024px), 4 at `xl` (1280px) — with a consistent 16px (`gap-4`) gutter at every breakpoint. Card internal padding stays 16px (`p-4`) on all sides; the header's internal gap between title block and controls is 12px (`gap-3`).

## Elevation & Depth

This is the sharpest departure from the prior world. The old system was flat-by-default with a single interactive exception (card hover-shadow). The Nixie-Tube world instead gives cards and the drag handle a permanent, ambient chassis depth — not something that only appears on hover:

- **`.ds-chassis-panel`** (cards): `inset 0 1px 0 0 var(--panel-chassis-highlight), inset 0 -1px 6px 0 var(--panel-chassis-shadow)` — a thin bright top lip plus a soft inset shadow, reading as a physical panel recessed slightly into its own surface. Subtle in light mode (consistent with the crisp, hairline-driven Binance surface), clearly visible in dark mode (consistent with the dim-room chassis-on-a-floor scene).
- **`.ds-panel-fastener`** (the drag handle): `inset 0 1px 2px 0 var(--panel-chassis-shadow)` — a small inset shadow suggesting a countersunk mount point, distinct from the flat icon buttons (theme toggle, refresh) that sit beside it.
- **Digit-tube glow** (dark mode only): two-layer `text-shadow` — `0 0 2px var(--panel-amber-glow-core)` (tight, near-opaque core) plus `0 0 16px var(--panel-amber-glow)` (wide, soft halo). Both tokens are `transparent` in light mode, so no glow renders there at all — see the Native-Scene Rule.
- **Sparkline end-dot glow**: an SVG `feGaussianBlur` + `feMerge` filter (`stdDeviation="1.5"`), applied only to the trend-line's final point, via a per-instance `useId()`-scoped filter id so multiple cards' glows never collide in the DOM.

Card hover no longer changes elevation — it changes the border color to `panel-amber` at 40% opacity instead, consistent with the Single-Amber Rule (amber marks "interactive," not a shadow step).

### Named Rules
**The Ambient-Depth Rule.** Chassis depth (the inset highlight/shadow pairing) is a resting-state material property of cards and the drag handle, not a hover-triggered elevation change. Hover communicates interactivity through the amber border instead.

**The Two-Layer Glow Rule.** Wherever the amber accent glows (digit tubes, sparkline end-dot), it uses a tight near-opaque core plus a separate wide soft halo — never a single shadow layer. A single soft shadow was tried and reviewed as reading like "bold colored text," not a light source.

## Shapes

Two radius steps cover the whole system, down from the prior world's three: `rounded-lg` (0.5rem/8px) for every container and control — cards, buttons, inputs, the empty state — and fully round (`rounded-full`, 9999px) for anything meant to read as a dot, lamp, or mount point: the coin-logo avatar, the staleness badge and its indicator dot, and the drag-handle-as-panel-fastener. Borders are uniformly 1px hairlines in `panel-border`; the empty state keeps a dashed border variant to signal "nothing here yet" distinctly from a solid-bordered card.

## Components

### Focus & Motion (cross-cutting)
- **Focus:** every interactive control — both buttons, the filter input, the drag handle — shows a 2px `focus-visible` outline in `panel-amber`, 2px offset. This is the one place amber and the Visible-Focus discipline are the same rule: the accent that means "interactive" is also the accent that marks keyboard focus.
- **Reduced motion:** judged per animation, same discipline as before. The digit-tube cross-fade (`digit-crossfade`, 260ms, opacity + blur) is spatial-adjacent and gated under `prefers-reduced-motion: no-preference` — the new price still appears instantly without it. dnd-kit's drag-settle transform is dropped the same way. The Refresh icon's spin is `motion-safe:`-gated since the "Refreshing…" label already carries that state. The staleness lamp's color transition (`transition-colors duration-200`) is the one animation kept regardless — a color change isn't the spatial movement reduced motion asks apps to remove.

### Buttons
- **Shape:** `rounded-lg` (8px) for every button — Refresh, the theme toggle, and (as a circular exception) the drag handle.
- **Style:** transparent-to-chassis background, 1px `panel-border`, `panel-text-primary`/`panel-text-secondary` label color, hover border shifts to `panel-amber/40`. There is still no filled/primary button anywhere in the system.
- **Disabled:** 50% opacity, `cursor: not-allowed` — used mid-refresh or during a rate-limit cooldown ("Retry in Ns").

### Cards / Containers (Crypto Card — signature component)
- **Corner Style:** `rounded-lg` (8px).
- **Background:** `panel-chassis`.
- **Depth:** `.ds-chassis-panel` ambient inset depth (see Elevation & Depth) — not a hover-only shadow.
- **Border:** 1px `panel-border`, shifting to `panel-amber/40` on hover.
- **Internal Padding:** 16px on all sides.
- **Anatomy:** header row (28px circular coin logo + `<h2>` name + uppercase mono symbol, drag-handle fastener top-right) above a price row — the digit-tube USD readout and mono BTC line on the left, a glow-dotted sparkline plus trend delta chip ("+/-X.XX% · recent") on the right. The digit readout carries `data-changed` briefly true on an actual price change, driving the cross-fade; it is never true on mount or on a poll tick that didn't move the price (`useValueChangeFlash`).
- **Lit vs. unlit:** the price readout is amber and (in dark mode) glowing only when `rate` is truthy (`.ds-digit-readout--lit`); with no rate yet it renders as plain `panel-text-secondary` — an unlit tube, never a fabricated reading.

### Drag Handle / Panel Fastener
Circular (`rounded-full`), not the square `rounded-lg` every other icon control uses — a deliberate re-skin so it reads as a countersunk panel mount rather than a stock icon button borrowing the panel's colors. Inset `.ds-panel-fastener` shadow, border and icon color shift to amber on hover/focus. 36×36px hit area (10px padding around a 16px icon).

### Staleness Badge
Pill (`rounded-full`), `panel-page` background, `panel-border` hairline, `panel-text-secondary` label text — paired with a small lamp dot (`bg-current`, `shadow-[0_0_5px_currentColor]`) in one of four literal Tailwind hues (green/amber/red/gray) keyed to tier. Status is never color-alone: the dot is always paired with a text label ("Live", "Delayed, Ns ago", "Stale — Ns ago", "Loading…"/"Unavailable").

### Inputs / Fields
`rounded-lg`, 1px `panel-border`, leading search icon (16px, `panel-text-secondary`) with 36px left padding to clear it. Focus border shifts to `panel-amber/60` plus the standing amber focus-visible outline.

### Trend Sparkline (signature component)
64×24px inline SVG, unchanged in its core rule from the prior world: the line is always `status-muted`, only the end-dot takes the direction-specific status color, and that end-dot alone carries the two-layer glow filter (see Elevation & Depth).

## Do's and Don'ts

### Do:
- **Do** spend the amber accent only on "this is interactive" or "this is a live reading" — hover borders, focus rings, and lit digit tubes.
- **Do** keep trend/freshness meaning in the separate status/lamp vocabulary, never in amber.
- **Do** apply the two-layer glow (core + halo) wherever the amber accent needs to read as a light source; never a single shadow layer.
- **Do** gate spatial motion (digit cross-fade, drag-settle transform) under `prefers-reduced-motion`, and keep color-only transitions (the staleness lamp) ungated.
- **Do** render a coin with no rate yet as an unlit, plain-color digit tube — never fabricate a "reading."
- **Do** give every interactive control a visible amber `:focus-visible` outline.

### Don't:
- **Don't** use amber for market-direction or freshness state — that would collide "the instrument is on" with "the market moved."
- **Don't** apply the digit-tube glow in light mode — the glow tokens are `transparent` there by design; if a future light-mode glow is wanted, that's a deliberate new decision, not a default to restore.
- **Don't** add a shadow step to card hover — hover communicates via the amber border, not elevation; depth is already ambient at rest.
- **Don't** color a sparkline's full line by trend direction — only its end-dot carries the signal color.
- **Don't** add a filled/primary-style button; every button in this system is an outline/chassis control.
- **Don't** treat the StalenessBadge's literal lamp colors as a second general-purpose status token source — they are scoped to that one component (see below); new state-driven UI should route through `STATUS_COLOR`.
