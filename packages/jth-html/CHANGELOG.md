# @johnhenry/jth-html

## 0.1.0

### Minor Changes

- 5b6f71e: Add a single source of per-operator documentation. `registry.set(name, fn, { description, arity? })` records it; `registry.info(name)`, `registry.infos()` and `registry.dynamicInfos()` read it, and `getMeta(fn)` now returns `description` and `arity` for registered operators (timing annotations unchanged). Every built-in `jth-stdlib` and `jth-html` operator is documented (enforced by a test), the CLI gains `jth help <op>` / `jth help --ops`, and `docs/operators.md` is generated from the registry (`npm run docs:ops`).

### Patch Changes

- Updated dependencies [5b6f71e]
- Updated dependencies [33f0179]
- Updated dependencies [33f0179]
  - @johnhenry/jth-runtime@0.1.0
