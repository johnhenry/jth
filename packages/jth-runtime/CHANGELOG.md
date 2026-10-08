# @johnhenry/jth-runtime

## 0.1.0

### Minor Changes

- 5b6f71e: Add a single source of per-operator documentation. `registry.set(name, fn, { description, arity? })` records it; `registry.info(name)`, `registry.infos()` and `registry.dynamicInfos()` read it, and `getMeta(fn)` now returns `description` and `arity` for registered operators (timing annotations unchanged). Every built-in `jth-stdlib` and `jth-html` operator is documented (enforced by a test), the CLI gains `jth help <op>` / `jth help --ops`, and `docs/operators.md` is generated from the registry (`npm run docs:ops`).
- 33f0179: Security: the `jth-eval` sandbox now fails closed. An unrecognized `sandbox` value (a typo such as `"Restricted"`, `null`, a value read from config) used to fall through to full unrestricted access; it now throws `INVALID_SANDBOX`. `sandbox: "restricted"` is built only from ops registered by `jth-stdlib` (new `stdlibOpNames()`), so ops registered globally by other packages (for example `jth-html`'s `h-raw` / `h-render`) are no longer admitted; allow-list them explicitly with `sandbox: [...]`.

  Fixes from the post-release audit:

  - `run({ captureLog })` no longer replaces the global `console.log`; output of `peek` / `peek-all` is captured per evaluation (new `emit` / `captureOutput` in `jth-runtime`), so concurrent runs and unrelated host logging cannot corrupt each other. Inline-JS `console.log` calls are no longer captured.
  - Compiled programs no longer install a process-wide `uncaughtException` handler when merely imported; the handler is installed only when the module is the process entry point and only reports jth's own errors.
  - The configured operators `keepN(n)`, `retrieve(i)`, `dig(n)` and `bury(n)` are now registered and usable from `.jth` source.

- 33f0179: Add a typed `StackUnderflowError` (extends `JthRuntimeError`, code `STACK_UNDERFLOW`) thrown by `Stack.pop`, `popN`, `swap` and `dup`. It carries `expected`, `actual` and the failing `operator` name (attributed by `processN`); the generated code attaches the source `line`/`column`.

### Patch Changes

- Updated dependencies [5b6f71e]
- Updated dependencies [33f0179]
- Updated dependencies [33f0179]
  - @johnhenry/jth-types@0.1.0
