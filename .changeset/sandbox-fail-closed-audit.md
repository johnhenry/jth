---
"@johnhenry/jth-eval": minor
"@johnhenry/jth-stdlib": minor
"@johnhenry/jth-compiler": minor
"@johnhenry/jth-runtime": minor
"@johnhenry/jth-types": minor
---

Security: the `jth-eval` sandbox now fails closed. An unrecognized `sandbox` value (a typo such as `"Restricted"`, `null`, a value read from config) used to fall through to full unrestricted access; it now throws `INVALID_SANDBOX`. `sandbox: "restricted"` is built only from ops registered by `jth-stdlib` (new `stdlibOpNames()`), so ops registered globally by other packages (for example `jth-html`'s `h-raw` / `h-render`) are no longer admitted; allow-list them explicitly with `sandbox: [...]`.

Fixes from the post-release audit:

- `run({ captureLog })` no longer replaces the global `console.log`; output of `peek` / `peek-all` is captured per evaluation (new `emit` / `captureOutput` in `jth-runtime`), so concurrent runs and unrelated host logging cannot corrupt each other. Inline-JS `console.log` calls are no longer captured.
- Compiled programs no longer install a process-wide `uncaughtException` handler when merely imported; the handler is installed only when the module is the process entry point and only reports jth's own errors.
- The configured operators `keepN(n)`, `retrieve(i)`, `dig(n)` and `bury(n)` are now registered and usable from `.jth` source.
