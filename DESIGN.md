---
name: Crypto Dashboard
description: A restrained, grayscale instrument panel for live crypto exchange rates
colors:
  ink-primary: "#111827"
  ink-control: "#374151"
  ink-secondary: "#6b7280"
  ink-tertiary: "#9ca3af"
  surface: "#ffffff"
  surface-recessed: "#f9fafb"
  border-hairline: "#e5e7eb"
  border-control: "#d1d5db"
  market-green-light: "#15803d"
  market-green-dark: "#0ca30c"
  market-red-light: "#d03b3b"
  market-red-dark: "#ef4444"
  neutral-gray-light: "#676561"
  neutral-gray-dark: "#898781"
  badge-live-bg: "#dcfce7"
  badge-live-text: "#166534"
  badge-delayed-bg: "#fef3c7"
  badge-delayed-text: "#92400e"
  badge-stale-bg: "#fee2e2"
  badge-stale-text: "#991b1b"
  badge-never-bg: "#f3f4f6"
  badge-never-text: "#4b5563"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-control}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.ink-control}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    padding: "8px"
  drag-handle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-tertiary}"
    rounded: "{rounded.sm}"
    padding: "10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  badge-live:
    backgroundColor: "{colors.badge-live-bg}"
    textColor: "{colors.badge-live-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-delayed:
    backgroundColor: "{colors.badge-delayed-bg}"
    textColor: "{colors.badge-delayed-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-stale:
    backgroundColor: "{colors.badge-stale-bg}"
    textColor: "{colors.badge-stale-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-never:
    backgroundColor: "{colors.badge-never-bg}"
    textColor: "{colors.badge-never-text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  input-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "6px 12px 6px 36px"
---

# Design System: Crypto Dashboard

## Overview

**Creative North Star: "The Instrument Panel"**

This is a data-first dashboard, not a marketing surface: it reads like an instrument cluster built to be scanned at a glance, where the numbers are the interface and the chrome around them recedes on purpose. There is no brand accent color anywhere in the system — the entire UI is grayscale except for a small, fixed set of functional signal colors (market-green, market-red, neutral-gray, plus the amber/red/green badge pairs) that exist purely to carry state, never decoration. Every non-neutral pixel on screen is answering a question ("is this trending up?", "is this data fresh?") rather than expressing a personality.

Density stays comfortable rather than tight: cards get real breathing room (16px internal padding, 16px grid gutters), text sizes top out modestly (the largest text anywhere is 20px, on both the page title and each card's headline price — there is no oversized "hero" numeral), and the whole system rejects visual noise in favor of legibility at a glance. Nothing here was rejected from a louder direction; restraint was the starting brief, not a fallback.

**Key Characteristics:**
- Fully grayscale base palette; color exists only as functional signal (trend direction, freshness state), never as brand or decoration.
- Flat-by-default surfaces; the only shadow in the entire system is a single hover-elevation step on cards.
- One typographic ceiling (20px/600) shared by the page title and every card's price — no oversized hero type.
- Status is always color + a second cue (an icon, a label, or both) — color alone never carries meaning.
- Coin logos are the one genuinely decorative element allowed; everything else is typographic or geometric.

## Colors

Almost the entire palette is a neutral gray ramp; the only hues that exist are three fixed "signal" colors and a matching set of pastel/dark badge pairs used exclusively for the four data-freshness states. There is no primary or secondary brand color to speak of — this system deliberately has no accent.

### Primary (functional signal, not brand)
Each signal color is tuned independently per theme — not a single hex serving both — because the same value can't clear 4.5:1 against a white card *and* a near-black one. Resolved via CSS custom properties (`--status-good`/`--status-critical`/`--status-muted` in `app.css`, consumed through `STATUS_COLOR` in `statusPalette.ts`), never a fixed value baked into a component.
- **Market Green** — light `#15803d` / dark `#0ca30c`: the sole "positive" hue in the system. Used only for an upward price-trend sparkline dot and its delta-chip icon/text — never for anything decorative or brand-related.
- **Market Red** — light `#d03b3b` / dark `#ef4444`: the sole "negative" hue. Used only for a downward price-trend sparkline dot and its delta-chip icon/text.
- **Neutral Gray** — light `#676561` / dark `#898781`: the "flat/no change" trend signal — a distinct warm-gray, deliberately not reused from the UI's own neutral ramp, so a flat trend still reads as an intentional state rather than "uncolored."

### Neutral
- **Ink Primary** (`#111827`): headings, the page title, and every card's headline USD price — the darkest, highest-emphasis text in the system.
- **Ink Control** (`#374151`): button and control label text (Refresh, etc.) — one step lighter than heading text, so interactive labels read as slightly quieter than data.
- **Ink Secondary** (`#6b7280`): meta and secondary text — the page subtitle, a coin's symbol, the BTC sub-price line, default icon tint.
- **Ink Tertiary** (`#9ca3af`): placeholder text and the most recessive icon states (filter-input placeholder, unfocused search icon).
- **Surface** (`#ffffff`): card backgrounds and the base page background.
- **Surface Recessed** (`#f9fafb`): the page backdrop directly behind cards, and the hover fill for ghost buttons — one shade off white, just enough to separate a card from the page without a shadow doing the work.
- **Border Hairline** (`#e5e7eb`): card borders — the thinnest, quietest border weight.
- **Border Control** (`#d1d5db`): button and input borders, and the empty-state's dashed border — one step darker than a card's hairline, since controls need slightly more definition than a static card.

### Status Tiers (badges only)
- **Live** — bg `#dcfce7` / text `#166534`: data is fresh (≤10s old).
- **Delayed** — bg `#fef3c7` / text `#92400e`: data is aging but not yet a concern (10-60s old) — this is the normal signature of routine rate-limit pressure, not an outage, and its amber tone is deliberately calmer than an error color.
- **Stale** — bg `#fee2e2` / text `#991b1b`: data is old enough (>60s) to signal a real problem; also used for "never fetched, and the first fetch failed."
- **Never (loading)** — bg `#f3f4f6` / text `#4b5563`: no successful fetch yet, no error either — visually distinct from Stale so a first-time load never looks like a failure.

### Dark Mode
Dark mode is a systematic ramp swap, not a separate palette: the page background becomes `#030712` (gray-950), card surfaces become `#111827` (gray-900, i.e. light mode's Ink Primary — the ramp inverts around its own midpoint), hairline borders become `#1f2937` (gray-800), and text roles shift roughly 7-8 steps toward the light end of the same gray scale (e.g. Ink Primary's dark-mode text sits around `#f3f4f6`). The four badge pairs keep their light-mode hex value for the "text" role and move only their background to a dark, low-opacity tint of the same hue (e.g. Live's dark badge is `rgba(20,83,45,0.4)` background — green-900 at 40% — with `#86efac` (green-300) text) — the badges never change which hue means what, only how loud that hue is against a dark backdrop. The three signal colors are the one exception to "text keeps its light-mode value": each is re-tuned per theme (see Primary, above), not ramp-swapped, since a systematic swap wouldn't reliably land on 4.5:1 for an arbitrary starting hue the way the badges' bg/text split does.

### Named Rules
**The No-Brand-Color Rule.** Nothing in this system is colored for decoration or identity. A color is only ever earned by carrying a state — trend direction or data freshness. If a future addition wants a "brand" color, that is a deliberate identity decision to make explicitly, not a default to reach for.

**The Static-Scan Rule.** Signal colors (Market Green/Red/Neutral Gray) must be applied via inline `style` (or CSS variables), never as a Tailwind arbitrary-value class built from a JS constant (e.g. `` text-[${hex}] ``) — Tailwind's static source scanner cannot see a template-literal class name at build time and will silently drop it. This was a real bug in this codebase; the fix is the standing rule.

## Typography

**Display/Title Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Body Font:** Inter (same stack)
**Mono Font:** the platform monospace stack (`ui-monospace, SFMono-Regular, Menlo, monospace`) — no custom mono font is loaded

**Character:** A single, unshowy grotesque doing every job in the system — there is no separate display face. Inter's slightly humanist, highly legible-at-small-sizes character matches the "instrument panel" brief: it needs to read correctly at 12px in a badge as much as at 20px in a headline price.

### Hierarchy
- **Title** (600, 1.25rem/20px, line-height 1.3): the page's `<h1>` and every card's headline USD price share this single top tier — there is no larger "hero" size anywhere in the system.
- **Body** (400, 0.875rem/14px, line-height 1.4): the page subtitle, button labels, and the filter input's typed text.
- **Label** (500, 0.75rem/12px, letter-spacing 0.01em): a coin's symbol (uppercase), every badge's text, and small captions like the delta chip's "recent" caption.
- **Mono** (400, 0.75rem/12px, platform mono stack): the BTC sub-price value only — the one place where fixed-width digits matter for scanability across a column of cards.

### Named Rules
**The One-Tier-Up Rule.** Nothing in the interface is allowed to out-rank a card's own price in size or weight — the page title and the price sit at the exact same visual weight on purpose, reinforcing that the data is the content, not the chrome around it.

## Layout

The page is a single centered column, `max-w-6xl` (1152px) wide with 24px (1.5rem) of outer padding, holding a sticky, translucent header (backdrop-blur, 80% opacity surface, hairline bottom border — stays legible over scrolled content without fully occluding it) followed by the filter control and the card grid.

The grid is responsive by column count, not by card resizing: 1 column below `sm`, 2 at `sm`, 3 at `lg`, 4 at `xl`, with a consistent 16px (1rem) gap in both axes at every breakpoint. Card internal padding is 16px on all sides. The overall spacing rhythm is Tailwind's default 4px base scale; the values that actually recur are 4px (icon/label gaps), 8px (control internal gaps), 16px (card padding, grid gutter), and 24px (page outer padding) — there is no custom spacing scale beyond Tailwind's own steps.

## Elevation & Depth

Flat by default, everywhere, with exactly one exception: cards carry a barely-there `shadow-sm` at rest that deepens to `shadow-md` only on hover. No other surface in the system — buttons, inputs, badges, the sticky header — ever uses a shadow; separation there comes entirely from a hairline border or a background-color shift. Depth is not an ambient design layer here; it exists solely as interactive feedback on the one component a user might pick up and drag.

### Shadow Vocabulary
- **Card at rest** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — Tailwind `shadow-sm`): the default, near-invisible resting state.
- **Card on hover** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — Tailwind `shadow-md`): the only elevation change in the entire system, signaling "this is liftable/draggable."

### Named Rules
**The Flat-By-Default Rule.** Shadows exist solely as hover feedback on interactive cards. No other component — button, input, badge, header — ever gets a shadow, at rest or on hover; their separation comes from a border or a background shift instead.

## Shapes

Three radius steps cover the whole system, scaling roughly with a component's size: small controls (the card's drag-handle button) use a tight 4px (`rounded`), everyday interactive controls (buttons, the filter input) use 8px (`rounded-lg`), and cards and the empty-state container use a more generous 12px (`rounded-xl`) — cards are meant to read as distinct, well-formed objects, not just bordered boxes. Fully round (`rounded-full`, 9999px) is reserved for anything meant to read as a pill or a dot: badges, the small coin-logo avatar, and the staleness badge's tiny status dot. Borders are uniformly 1px hairlines; the only non-solid border in the system is the empty state's dashed border, which exists specifically to signal "nothing here yet" rather than "something is wrong."

## Components

### Focus & Motion (cross-cutting)
- **Focus:** every interactive control — both buttons, the filter input, and the card's drag handle — shows a 2px `outline` in Ink Primary (`gray-900` light / `gray-100` dark), 2px offset, on keyboard focus (`:focus-visible`). This is never suppressed; a prior version of the filter input shipped with `focus:outline-none` and no replacement indicator, a real WCAG 2.4.7 gap caught by audit and fixed by making this a standing invariant instead of a per-component choice.
- **Reduced motion:** judged per animation, not disabled globally. The card's hover-shadow transition and dnd-kit's drag-settle transform are both spatial and skipped entirely under `prefers-reduced-motion` (`motion-safe:` / a `usePrefersReducedMotion` check). The Refresh icon's spin is also gated behind `motion-safe:` since its "Refreshing…" label already carries the state without it. The staleness badge's tier color transition is the one animation kept regardless — a color change isn't the spatial movement reduced motion asks apps to remove.

### Buttons
- **Shape:** 8px radius (`rounded-lg`) for both the labeled Refresh button and the icon-only theme toggle; the card's drag-handle icon button uses the tighter 4px (`rounded`) since it is scaled to sit inside the card's own corner.
- **Touch target:** the drag handle's padding is 10px (`p-2.5`), giving a 36×36px hit area around its 16px icon — up from an original 24×24px, which was under the practical 44×44px minimum for what is this app's sole grab affordance on a required interaction (drag-and-drop reordering).
- **Ghost/ Ideal (the only variant that exists):** transparent background, 1px `border-control` border, `ink-control` text, `surface-recessed` background on hover. There is no filled/primary button anywhere in this system — every button is an outline/ghost control, matching the "chrome recedes" brief.
- **Disabled:** 50% opacity, `cursor: not-allowed` — used while a refresh is in flight or the rate-limit budget forces a cooldown ("Retry in Ns").
- **Icon-only variants** (theme toggle, drag handle): no visible border in the card's drag-handle case (it only reveals its hover background on interaction); the header's theme toggle keeps its border for consistency with the Refresh button beside it.

### Badges
- **Style:** fully round (`rounded-full`) pill, one of four fixed bg/text color pairs (Live/Delayed/Stale/Never — see Colors), always paired with a small solid dot (`background-color: currentColor`) so status is never color-alone.
- **State:** exactly one is shown at a time, driven by data age; there is no interactive/selectable variant.

### Cards / Containers
- **Corner Style:** 12px (`rounded-xl`).
- **Background:** `surface` (white) at rest; `surface-dark-card` (`#111827`) in dark mode.
- **Shadow Strategy:** see Elevation & Depth — the system's only hover-shadow behavior lives here.
- **Border:** 1px `border-hairline`.
- **Internal Padding:** 16px (`spacing.md`) on all sides.
- **Anatomy:** a header row (28px circular coin logo + an `<h2>` name + uppercase symbol, with the drag handle appearing top-right) above a price row (large USD price + monospace BTC line on the left; a 64×24px sparkline plus a trend delta chip on the right). The name is a real heading, not a styled div, so the grid is heading-navigable for screen-reader users.

### Inputs / Fields
- **Style:** 8px radius, 1px `border-control` border, a leading icon (16px, `ink-tertiary`) absolutely positioned with generous left padding (36px) to clear it.
- **Focus:** border darkens by one step (`border-control` → `gray-400`) *and* shows the standing focus-visible outline (see Focus & Motion, above) — an earlier version relied on the border shift alone with `outline-none`, which measured as no visible keyboard-focus indicator at all.
- **Error / Disabled:** not applicable — this input has no validation state.

### Sparkline (signature component)
A 64×24px inline SVG trend indicator, unique to this system: the line itself is always drawn in `neutral-gray` regardless of trend direction, and only the single dot marking the most recent value is colored (`market-green`/`market-red`/`neutral-gray`) by trend. This is deliberate — a sparkline whose entire line changes color by direction reads as noisier and harder to place next to the delta chip's own trend color; keeping the line neutral and letting one dot carry the color keeps the "color = state, nothing else" rule intact even inside a chart.

### Named Rules
**The Muted-Line Rule.** A trend sparkline's line is always the neutral/muted hue; only its terminal point ever takes the signal color. No sparkline line is ever colored by direction across its full length.

## Do's and Don'ts

### Do:
- **Do** treat every color as a state signal, not decoration — before adding any new hue, ask what state it represents.
- **Do** pair every status or trend color with a non-color cue (an icon, a visible label, or both) — color alone never carries meaning anywhere in this system.
- **Do** keep the drag/trend/staleness signal colors flowing through a single shared source of truth (`STATUS_COLOR` in code) rather than redefining them per component, so they cannot drift apart.
- **Do** apply signal colors via inline style/CSS variables, never a Tailwind class built from a runtime constant.
- **Do** keep the page title and a card's headline price at the same type size and weight — neither should ever out-rank the other.
- **Do** give every interactive control a visible `:focus-visible` outline — see Focus & Motion under Components.
- **Do** judge each animation against `prefers-reduced-motion` individually: drop spatial movement, keep color/state transitions that carry meaning.

### Don't:
- **Don't** add a shadow to anything except a card, and only as hover feedback — not at rest, and not to any other component.
- **Don't** introduce a brand/decorative accent color; every non-neutral pixel must be answering "what state is this."
- **Don't** color a sparkline's full line by trend direction — only its end marker carries the signal color.
- **Don't** add a filled/primary-style button; every button in this system is an outline/ghost control.
- **Don't** raise any text above the 20px/600 "Title" tier without a deliberate, system-wide decision — there is no hero-text precedent to extend from.
- **Don't** ship `outline-none` (or equivalent) on any focusable element without an equally visible replacement indicator — this has already regressed once.
- **Don't** give a single signal color one fixed hex for both themes; verify each theme's contrast independently before reusing a value across light and dark.
