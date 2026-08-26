# Changelog

## Unreleased

- Normalized `examples/` to numbered `NN-name.jth` files with an index
  (`examples/README.md`), per-example `example:NN` npm scripts, an `examples`
  script that runs them all through the built CLI, and an examples smoke step
  in CI.
- Added this changelog.

## 2026-08-25 — @johnhenry scope adoption

All 9 packages moved into the `@johnhenry` npm scope, with versions restarted
at `0.0.0` — a new address and era, not a maturity signal. Also added
Turborepo for build orchestration and caching.

Per-package renames (every package was previously published unscoped at
`0.4.0`):

| Now | Previously |
|-----|------------|
| `@johnhenry/jth` (the CLI, binary `jth`) | `jth-lang@0.4.0`, itself renamed from `jth-cli@0.1.0` |
| `@johnhenry/jth-runtime` | `jth-runtime@0.4.0` |
| `@johnhenry/jth-compiler` | `jth-compiler@0.4.0` |
| `@johnhenry/jth-stdlib` | `jth-stdlib@0.4.0` |
| `@johnhenry/jth-types` | `jth-types@0.4.0` |
| `@johnhenry/jth-repl` | `jth-repl@0.4.0` |
| `@johnhenry/jth-eval` | `jth-eval@0.4.0` |
| `@johnhenry/jth-html` | `jth-html@0.4.0` |
| `@johnhenry/jth-ai` | `jth-ai@0.4.0` |

(The unscoped npm name `jth` belongs to another user, which is why the CLI
originally shipped as `jth-lang`; the scoped name `@johnhenry/jth` has no such
constraint.)
