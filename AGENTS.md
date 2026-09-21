# Agent playbook

npm workspaces monorepo, 9 packages under `packages/`, Node >= 26,
Vitest for tests, orchestrated with Turborepo. Unlike some sibling
`@johnhenry/*` repos, packages here **do** build to `dist/` — cross-package
types and imports resolve through each package's built output, not its
source.

`CLAUDE.md` in this directory is a symlink to this file.

## Workspace structure and build order

Packages are declared in `package.json`'s `workspaces` array in dependency
order — `jth-types` first, `jth-cli` last:

| Package | Role |
| --- | --- |
| [`jth-types`](packages/jth-types) | Shared TypeScript types |
| [`jth-runtime`](packages/jth-runtime) | Stack-machine runtime |
| [`jth-compiler`](packages/jth-compiler) | Compiles jth source to JavaScript |
| [`jth-stdlib`](packages/jth-stdlib) | Standard library operators |
| [`jth-repl`](packages/jth-repl) | REPL / evaluator, including sandboxed evaluation |
| [`jth-html`](packages/jth-html) | HTML-related ops |
| [`jth-ai`](packages/jth-ai) | AI integration helpers (Ollama) |
| [`jth-eval`](packages/jth-eval) | Lower-level evaluation primitives used by `jth-repl` |
| [`jth-cli`](packages/jth-cli) | Command-line interface; publishes as `@johnhenry/jth` (binary `jth`) |

## The verification loop (before every push)

Build must run before typecheck or test — cross-package imports resolve
through `dist/`, not source, so a stale or missing build produces
misleading typecheck/test failures that look like real bugs.

```bash
npm run build       # turbo run build
npm run typecheck   # turbo run build && tsc -b
npm run test:unit   # vitest run (fast loop while iterating)
npm test            # turbo run build && vitest run — what CI actually runs
npm run examples    # every shipped example, run through the built CLI
```

CI (`.github/workflows/ci.yml`) runs, in order: install, build, typecheck,
`test:unit`, then an examples smoke test. Match that order locally before
pushing — a change that only ran `test:unit` without a fresh build can pass
locally and fail in CI.

## Repo-specific gotchas

- **The REPL and `jth run -c` are unsandboxed by default.** Inline JS
  (`((...))`) has full access to `process`, the filesystem, and the
  network. If you're embedding jth evaluation for untrusted input, use
  `createEvaluator({ sandbox: ... })` from `jth-repl`, or `jth-eval`
  directly — never assume evaluation is safe by default.
  See [`jth-repl`'s README](packages/jth-repl/README.md#sandboxing-opt-in).
- **The published npm package name doesn't match the package directory.**
  `packages/jth-cli` publishes as `@johnhenry/jth` (not
  `@johnhenry/jth-cli`), and the binary it installs is `jth`. Don't assume
  directory name == package name when wiring up dependencies or docs links.
  Previously published as `jth-lang@0.4.0`, itself renamed from
  `jth-cli@0.1.0`.
- **Examples double as a regression suite.** `examples/[0-9]*.jth` are run
  by both `npm run examples` locally and the CI "Examples smoke" step,
  driven through the actually-built CLI (`packages/jth-cli/dist/bin/jth.js`).
  A language change that breaks one of these fails CI even if the unit
  suite is green.

## Releases

See `PUBLISHING.md`. Root `CHANGELOG.md` tracks the release history; the
family's Changesets convention is not used per-package here — check
`PUBLISHING.md` before changing that.
