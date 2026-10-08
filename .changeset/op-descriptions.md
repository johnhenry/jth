---
"@johnhenry/jth-types": minor
"@johnhenry/jth-runtime": minor
"@johnhenry/jth-stdlib": minor
"@johnhenry/jth-html": minor
"@johnhenry/jth": minor
---

Add a single source of per-operator documentation. `registry.set(name, fn, { description, arity? })` records it; `registry.info(name)`, `registry.infos()` and `registry.dynamicInfos()` read it, and `getMeta(fn)` now returns `description` and `arity` for registered operators (timing annotations unchanged). Every built-in `jth-stdlib` and `jth-html` operator is documented (enforced by a test), the CLI gains `jth help <op>` / `jth help --ops`, and `docs/operators.md` is generated from the registry (`npm run docs:ops`).
