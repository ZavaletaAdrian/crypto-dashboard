#!/usr/bin/env node
// Runs vitest with an extra NODE_OPTIONS flag appended (not overwritten) —
// Node 22+'s experimental global `localStorage` getter shadows jsdom's fully
// working one, breaking window.localStorage in tests. Appending here (rather
// than `cross-env NODE_OPTIONS=...`) preserves any NODE_OPTIONS a CI
// environment or the user's shell already sets (e.g. memory limits).
import { spawnSync } from "node:child_process";

const EXTRA_FLAG = "--no-experimental-webstorage";
const existing = process.env.NODE_OPTIONS ?? "";
const nodeOptions = existing ? `${existing} ${EXTRA_FLAG}` : EXTRA_FLAG;

const result = spawnSync("vitest", process.argv.slice(2), {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
