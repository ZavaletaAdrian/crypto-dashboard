# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both real, in this order of near-term weight:

1. **Hiring reviewer (primary, near-term):** evaluates this submission against explicitly stated grading criteria — clean/modular/idiomatic React + Remix code, strict TypeScript, maintainable styling, async/API handling, UX polish (loading/error states), sound tradeoff reasoning, and clear AI-collaboration guidelines (`AGENTS.md`).
2. **Casual crypto watcher (aspirational, kept genuine):** someone glancing at live USD/BTC prices for a small set of major coins. Product truth is recorded as if this user is real and could show up, so the assessment framing never leaks into the product's own design decisions.

## Product Purpose

A live cryptocurrency exchange-rate dashboard: a card per coin (name, symbol, USD rate, BTC rate) for a curated set of major coins, drag-and-drop reordering, and name/symbol filtering, backed by a public rate API under a self-imposed rate budget. It exists to demonstrate production-quality engineering judgment under real constraints — not just working code, but named engineering tensions resolved explicitly, in both implementation and written reasoning. Success means the same build reads as correct and resilient to a reviewer inspecting the code and reasoning, and as fast, trustworthy, and pleasant to a real person checking prices.

## Positioning

Not competing in a market — its distinguishing claim is architectural. It names and resolves five specific engineering tensions that "real-time data meets a rate-limited API" always produces (freshness vs. rate limits, list scale vs. drag interactivity, instant reordering feel vs. durable persisted order, resilience vs. simplicity, and filtering semantics interacting with reordering) rather than silently defaulting to one side or leaving the conflict unaddressed.

## Operating Context

- Data source: Coinbase's public, unauthenticated `/v2/exchange-rates` and `/v2/currencies/crypto` endpoints (one call refreshes USD and BTC pricing for every coin via a shared cross-rate).
- Self-imposed rate budget of 10 requests/minute (an assessment constraint, not Coinbase's real limit), enforced server-side by a token bucket shared across every client/tab.
- Deployed on Vercel, on serverless functions (no persistent process) — this has real, already-encountered operational consequences (see Capabilities and Constraints).
- Git workflow mirrors a real team: `main` (prod) / `develop` (UAT) / one feature branch per unit of work, each merged to `develop` via PR with mandatory GitHub Copilot review rounds before merge.
- CI (GitHub Actions) runs typecheck, tests, and build on every pull request before merge is allowed.

## Capabilities and Constraints

- Curated list of roughly 15-20 major coins (BTC, ETH, USDT, USDC, XRP, SOL, ADA, DOGE, TRX, LINK, DOT, LTC, BCH, AVAX, UNI, …), not the full ~900-currency Coinbase catalog. This is a deliberate, documented scope choice (the README's "T2," explicitly descoped for now) rather than a technical ceiling — full-catalog virtualization is a known, revisitable extension, not a limitation to work around silently.
- Vercel serverless hosting freezes the process between invocations, so a self-rescheduling background timer never fires again after the request that started it completes. This was hit as a real production bug (the staleness badge got stuck) and fixed by making freshness reactive — checked and refreshed on every read path, never on a standalone timer loop. Any future scheduled or background-feeling work in this app must account for this.
- Dark mode is class-based (`.dark` on `<html>`), persisted to `localStorage` only on an explicit user toggle — a system-derived default is never silently written as a permanent preference — with a blocking inline pre-paint script to avoid a flash of the wrong theme, including when storage access itself throws.
- Drag-and-drop order is `localStorage`-backed, written synchronously (no debounce window a reload could race), and kept in sync across open tabs.
- Read-only: no authentication, no user accounts, and no write-back to any external system.

## Brand Commitments

None established. No existing name/logo/voice constraints beyond the working title "Crypto Dashboard." Coin logos are sourced from the `cryptocurrency-icons` npm package (bundled offline) rather than an external CDN, to avoid a runtime network dependency for something purely cosmetic.

## Evidence on Hand

- `README.md` — full "Tension Decisions" reasoning for all five named tensions, plus setup and architecture documentation.
- `AGENTS.md` — module boundaries and conventions for future AI-assisted work on this codebase.
- No real user research, testimonials, analytics, or usage data exists, and none should be fabricated for either audience.

## Product Principles

1. Every conflict between "feels real-time" and "respects a hard rate budget" gets resolved explicitly and reasoned about in writing — never silently picked.
2. Resilience over simplicity where they conflict: stale data stays visible and clearly labeled rather than replaced by an error state or a blank screen.
3. User-driven state (coin order, theme) is never silently overwritten by a system-derived default, and never lost on reload.
4. Filtering is non-destructive: it changes what is visible, never the underlying order, and never an unrelated drag's effect on currently-hidden items.
5. Code quality is itself part of the product — modularity, strict typing, and written tradeoff reasoning are deliverables, not implementation detail invisible to evaluation.

## Accessibility & Inclusion

No formal standard mandated. Already in place: drag-and-drop is keyboard-operable (dnd-kit's keyboard sensor alongside pointer), staleness/status signaling pairs an icon with a label rather than relying on color alone, and dark mode falls back to `prefers-color-scheme` until the user makes an explicit choice.
