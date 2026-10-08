# @johnhenry/jth

## 0.1.0

### Minor Changes

- 3d3d617: Add a `--sandbox[=mode]` flag to `jth run` (file or `-c`) and `jth repl`. A bare `--sandbox` means `restricted`; `bare` (no stdlib) and a comma-separated operator allowlist are also accepted, and an invalid value is an error (fails closed). `jth run --sandbox` prints the final stack, one item per line. `startRepl()` now accepts `CreateEvaluatorOptions`, and the sandboxed evaluator no longer swallows output from allow-listed printing ops.
- 5b6f71e: Add a single source of per-operator documentation. `registry.set(name, fn, { description, arity? })` records it; `registry.info(name)`, `registry.infos()` and `registry.dynamicInfos()` read it, and `getMeta(fn)` now returns `description` and `arity` for registered operators (timing annotations unchanged). Every built-in `jth-stdlib` and `jth-html` operator is documented (enforced by a test), the CLI gains `jth help <op>` / `jth help --ops`, and `docs/operators.md` is generated from the registry (`npm run docs:ops`).

### Patch Changes

- Updated dependencies [3d3d617]
- Updated dependencies [5b6f71e]
- Updated dependencies [33f0179]
- Updated dependencies [33f0179]
  - @johnhenry/jth-repl@0.1.0
  - @johnhenry/jth-types@0.1.0
  - @johnhenry/jth-runtime@0.1.0
  - @johnhenry/jth-stdlib@0.1.0
  - @johnhenry/jth-compiler@0.1.0
