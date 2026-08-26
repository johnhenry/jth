# Changelog

## Unreleased

- **Security fix (jth-eval sandbox bypass):** `::name` value-definitions
  now compile-time reject in sandboxed mode — previously they compiled to
  an unconditional `globalThis` write (mid-statement) or could shadow the
  `registry` runtime binding (terminal position), bypassing every
  `jth-eval` sandbox mode. (#49)
- Compiler: reserved JS keywords are now rejected as `:name`/`::name`
  definitions instead of emitting invalid JS (#33); hyphenated
  `::import { ... }` bindings are now sanitized instead of emitting invalid
  JS (#34); parser recursion is now depth-limited, replacing an uncaught
  `RangeError` with a `JthParserError` on deeply nested input (#35);
  odd-count `{ ... }` object literals now raise a compile error instead of
  silently compiling to an array (#36); inline JS `((...))` no longer
  miscounts parens inside string/template literals or comments (#37);
  malformed hex literals (`0x` with no digits) now raise a lexer error
  instead of silently becoming `NaN` (#38).
- Runtime/stdlib: `Stack.pop()`/`popN()`/`swap()`/`dup()` now throw
  `JthRuntimeError` (`STACK_UNDERFLOW`) instead of silently returning
  `undefined`/no-op'ing (#39, #40) — this also fixes comparison operators
  silently "succeeding" on an empty stack (#41); `try` now always leaves
  exactly one new value (the caught `Error`) on the stack, discarding
  whatever the failing block pushed first (#42); `map`/`filter`/`reduce`
  now throw `JthRuntimeError` (`TYPE_ERROR`) for non-array/non-function
  operands instead of a raw `TypeError` (#43); `get` in `dict-ops` now
  guards against `null`/`undefined` targets like `drill` already did (#44).
- CLI: `compile --no-bundle` now rewrites relative `::import` paths when
  the output lands in a different directory than the input, instead of
  silently emitting an import that resolves against the wrong directory
  (#45); `run --no-bundle` is now rejected with a clear error instead of
  being silently mis-parsed as a filename (#46).
- REPL: `createEvaluator()` now accepts an opt-in `sandbox` option that
  routes evaluation through `jth-eval`'s `JthContext` (default remains
  unsandboxed — not a breaking change) (#47); each `createEvaluator()`
  instance now gets its own isolated operator registry instead of leaking
  `:name` definitions through jth-compiler's shared global registry (#48).
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
