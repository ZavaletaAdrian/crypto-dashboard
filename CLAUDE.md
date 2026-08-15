# CLAUDE.md

Project-specific guidance for Claude Code. Read in this order: this file, then `README.md` (architecture + the five Tension Decisions), then `AGENTS.md` (module boundaries and coding conventions), then `PRODUCT.md` / `DESIGN.md` (product truth and the visual system, owned by the `impeccable` skill).

## Locked functional requirements — do not change without explicit approval

This project was built against a fixed assignment spec. Visual redesign, refactors, or "improvements" must never alter what's described below unless the user explicitly asks for that specific change. When in doubt, preserve behavior and ask.

1. **Card layout:** at least 10 cryptocurrencies, each card showing name, symbol, USD rate, and BTC rate.
2. **Dynamic data fetching:** real-time-feeling rates from a public API, updated on page load, with manual/auto refresh.
3. **Drag-and-drop reordering:** persists while the user stays on the page.
4. **Filtering:** a text input at the top that filters the list by name or symbol.
5. **Five engineering tensions**, all five reasoned about in the README's "Tension Decisions" section, at least two fully implemented in code:
   - **T1** — freshness (≤10s) vs. a shared 10 requests/minute budget across all tabs.
   - **T2** — scale (500+ coins) vs. interactivity (filtering + drag-and-drop staying smooth).
   - **T3** — instant reorder feel vs. a durable, corruption-proof saved order (including reload-right-after-drop and two-tabs-at-once).
   - **T4** — resilience vs. simplicity: stale data stays visible with a clear staleness indicator instead of an error page; defines "too stale" and the first-time-visitor-with-no-cache case.
   - **T5** — filtering × reordering: drag-and-drop must work while filtered; hidden cards' positions must behave in a defensible, least-surprising way when visible ones move.

   Current status (see README for full reasoning): **T1, T3, T4, T5 are fully implemented; T2 is deliberately descoped** and documented as a revisitable extension (threshold-based virtualization), not a gap to silently fix.

Grading also explicitly weighs: clean/modular/idiomatic React + Remix code, strict TypeScript, maintainable styling, sound async/API handling, UX polish (loading/error/staleness states), sound tradeoff reasoning, and this file's clarity for follow-up AI work.

## Design work goes through the `impeccable` skill

`PRODUCT.md` and `DESIGN.md` (plus its `.impeccable/design.json` sidecar) are owned by the `impeccable` skill, not hand-edited ad hoc:

- Product truth (audience, purpose, constraints) lives in `PRODUCT.md`.
- The visual system ("The Instrument Panel" — grayscale, flat-by-default, signal color only ever means state) lives in `DESIGN.md`.
- Any new surface, component, or visual refinement should run through the relevant `/impeccable` command (`polish`, `harden`, `colorize`, `layout`, etc.) so the design system stays a single source of truth instead of drifting screen-by-screen.
- `DESIGN.md` governs *how things look*. It never overrides the locked functional requirements above — a redesign changes color/type/spacing/motion, not what data is shown, how filtering works, or what the five tensions resolve to.

Chart/sparkline work (the trend sparkline, any future stat tile) follows the `dataviz` skill's color and marks rules — already reflected in `DESIGN.md`'s "Muted-Line Rule."

## Git workflow

`main` (protected, production) ← `develop` (integration) ← `feature/<name>` branches, one per unit of work. Every feature branch gets a PR into `develop` with GitHub Copilot requested as a reviewer; push fixes, re-request review, and only merge once a review round comes back clean. `develop` → `main` happens via its own PR, not a local merge. Full conventions (module boundaries, testing, state-management patterns) are in `AGENTS.md` — this file exists so Claude Code loads project context automatically; it intentionally doesn't repeat what's already there.

## Before merging anything

`npm test`, `npm run typecheck`, and `npm run build` must all pass. For UI changes, actually run `npm run dev` and check the feature in a browser — type checking doesn't verify a feature works, and a design-system change especially needs a visual look, not just a green build.
