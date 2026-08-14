# AGENTS.md

Guidance for AI-assisted work on this repo. Read `README.md` first for the architecture overview and the reasoning behind T1–T5.

## Module boundaries

- **`app/services/*.server.ts`** — server-only. Only these files (and `app/routes/*` loaders/actions) may import `coinbase.server.ts` or touch `rateCache`/the token bucket. Never import a `.server.ts` module from client code, including type-only imports — put shared wire types in `app/types/` instead (see `app/types/rates.ts`, which exists specifically to keep `RatesPayload` out of a server-only file).
- **`app/utils/*.ts`** — pure functions, no DOM/network/React dependency. Every util has a matching `*.test.ts`. If you add logic here, add the test alongside it in the same commit.
- **`app/hooks/*.ts`** — the only place React state for a given concern lives. `useRatesPolling` owns the rates snapshot, `useOrderedCoins` owns the durable order, `useFilteredVisibleCoins` derives the visible subset. Components stay presentational: they receive data + callbacks as props and don't manage their own cross-cutting state.
- **`app/components/*.tsx`** — presentational. A component is allowed to own *display-only* local state (e.g. `RefreshButton`'s own 1s countdown tick) but never the actual data-flow state a hook already owns.

Data flows one direction: `rate-cache.server.ts` → route loader/`api.rates.ts` → hooks → components (as props) → user interaction → callback back into the owning hook → state update → re-render. If you find yourself passing a setter down through more than one component layer, the state probably belongs in a hook instead.

## Conventions to follow

- **Server-side singletons use the `globalThis.__x ??= ...` guard** (see `rate-cache.server.ts`, `coin-catalog.server.ts`) — this specifically survives Vite's dev-server HMR re-executing module top-level code on file save, which would otherwise spawn duplicate timers/state.
- **Prefer the `setState` updater-function form** over closing over state directly in a callback when the callback could plausibly be invoked again before React re-renders (see `useOrderedCoins.reorderVisible`). This was a real bug caught in review, not a style preference.
- **Wrap `localStorage` reads and writes in try/catch.** Storage can be disabled or full; a thrown exception there must not crash the UI (see `useOrderedCoins`).
- **Model sparse maps as `Partial<Record<string, T>>`, not `Record<string, T>`.** Coinbase's response doesn't cover every coin we display (see `CoinRateMap` in `app/types/coin.ts`) — the plain `Record` form hides that at every call site.
- **Don't add a new coin data source, cache, or timer without going through `rate-cache.server.ts`'s token bucket.** The entire point of T1 is that *nothing* calls Coinbase outside that one gate.

## Git workflow

`main` (protected, production) ← `develop` (integration) ← `feature/<name>` branches, one per module/feature. Each feature branch gets a PR into `develop` with Copilot requested as a reviewer; address every comment (or state why not) before merging. `develop` → `main` happens via PR, not a local merge.

## Extending this app

- **New tension work / revisiting T2:** the intended design (threshold-based virtualization + dnd-kit autoScroll) is written out in the README's T2 section. Read it before starting — the threshold value and the reason plain-vs-virtualized modes don't conflict are both load-bearing decisions, not arbitrary.
- **New coin data source:** add fetch logic to `coinbase.server.ts` (keep it a thin client, no caching/limiting logic there), and consume it from `rate-cache.server.ts` or a new sibling service that owns its own cache/limiter — don't bolt a second concern onto the existing rate cache.
- **New persisted client state (beyond order):** follow `orderPersistence.ts`'s pattern — a versioned payload shape, a schema validator that rejects malformed data instead of throwing, and a merge/repair function for reconciling stored data against live server data.
- **Before merging anything:** `npm test`, `npm run typecheck`, `npm run build` must all pass. For UI changes, actually run `npm run dev` and check the feature in a browser — type checking doesn't verify a feature works.
