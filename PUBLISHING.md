# Publishing jth to npm

The monorepo publishes nine packages under the `@johnhenry` npm scope: `@johnhenry/jth-types`, `@johnhenry/jth-runtime`, `@johnhenry/jth-compiler`, `@johnhenry/jth-stdlib`, `@johnhenry/jth-repl`, `@johnhenry/jth-eval`, `@johnhenry/jth-html`, `@johnhenry/jth-ai`, and the CLI **`@johnhenry/jth`** (directory `packages/jth-cli`, binary `jth`). All are published together at the same version from the workspace root, restarting at `0.0.0` for the scoped move (previously unscoped at `0.4.0`; the CLI package specifically was `jth-lang@0.4.0`, itself renamed from `jth-cli@0.1.0` — see each package's README for its exact prior identity).

## One-time setup

> **Scoped rename invalidates any existing `NPM_TOKEN`.** A granular token
> minted for the old unscoped names (`jth-types`, `jth-lang`, …) cannot
> *create* the new `@johnhenry/jth-*` packages — the first scoped publish
> will fail with `E404 on PUT` from npm, which is npm's (misleading) way of
> reporting a permission error, not "not found." A new, scope-capable
> automation token must be minted and set as `NPM_TOKEN` before the first
> release under the new names.

Choose one of:

**A. CI publishing (recommended)** — set the `NPM_TOKEN` repository secret:

1. Create an npm automation token: <https://www.npmjs.com/settings/~/tokens> → *Generate New Token* → **Automation** (bypasses 2FA for CI). Make sure it has publish permission for the `@johnhenry` scope (or is unrestricted), not just the old unscoped package names.
2. Add it to the GitHub repo: *Settings → Secrets and variables → Actions → New repository secret*, name `NPM_TOKEN`.

**B. Local publishing** — log in once on your machine:

```bash
npm login
```

## Release flow (CI)

1. Make sure `main` is green and versions are bumped (all packages share one version; bump every `packages/*/package.json`, the root, and the inter-package `^x.y.z` ranges, then `npm install` to sync the lockfile).
2. Create and publish a GitHub release (tag e.g. `v0.0.0` for the first scoped release, then normal semver bumps thereafter):

   ```bash
   gh release create v0.0.0 --title "v0.0.0" --generate-notes
   ```

3. The `Publish` workflow (`.github/workflows/publish.yml`) triggers on the published release: `npm ci` → `npm run build` → `npm test` → `npm publish --workspaces --access public`. It can also be run manually from the Actions tab (*workflow_dispatch*).

## Release flow (local)

```bash
npm ci
npm run build
npm test
npm publish --workspaces --access public
```

Each package's `prepublishOnly` runs its build again defensively; `files: ["dist"]` ensures only built output ships.

## Verify

```bash
npm view @johnhenry/jth version
npx -y @johnhenry/jth --help          # or: npm i -g @johnhenry/jth && jth --help
```

## Deprecating the old package names (optional; requires interactive npm auth)

`npm deprecate` (and `npm unpublish`) reject granular CI tokens with a 403, so
these must be run interactively by a maintainer logged in via `npm login` —
do not attempt them from CI or an agent.

Dormant 2022 placeholders, unrelated to the current live packages:

```bash
npm deprecate jth-cli@"<=0.1.0" "Renamed to jth-lang"
# and, if desired, the other legacy placeholders:
npm deprecate jth-core@"<=0.1.0" "Superseded by the @johnhenry/jth toolchain"
npm deprecate jth-tools@"<=0.1.0" "Superseded by the @johnhenry/jth toolchain"
npm deprecate jth-stats@"<=0.1.0" "Superseded by the @johnhenry/jth toolchain"
```

Once the `@johnhenry/jth-*` packages have their first successful scoped
publish, the *previously live* unscoped names (`jth-types`, `jth-runtime`,
`jth-compiler`, `jth-stdlib`, `jth-repl`, `jth-eval`, `jth-html`, `jth-ai`,
`jth-lang`, all last published at `0.4.0`) become deprecation candidates too
— point their users at the new scope:

```bash
npm deprecate jth-types@"<=0.4.0" "Moved to @johnhenry/jth-types"
npm deprecate jth-runtime@"<=0.4.0" "Moved to @johnhenry/jth-runtime"
npm deprecate jth-compiler@"<=0.4.0" "Moved to @johnhenry/jth-compiler"
npm deprecate jth-stdlib@"<=0.4.0" "Moved to @johnhenry/jth-stdlib"
npm deprecate jth-repl@"<=0.4.0" "Moved to @johnhenry/jth-repl"
npm deprecate jth-eval@"<=0.4.0" "Moved to @johnhenry/jth-eval"
npm deprecate jth-html@"<=0.4.0" "Moved to @johnhenry/jth-html"
npm deprecate jth-ai@"<=0.4.0" "Moved to @johnhenry/jth-ai"
npm deprecate jth-lang@"<=0.4.0" "Moved to @johnhenry/jth"
```

## Notes

- The unscoped npm name `jth` is owned by another user; that constraint no
  longer applies now that the CLI publishes under the `@johnhenry` scope as
  `@johnhenry/jth` — the installed binary is still `jth`.
- `jth-ai` (now `@johnhenry/jth-ai`) is a JS-only helper library (registers no jth words); it publishes like the rest.
- The smoke test (`test/smoke/pack-install.test.ts`) already exercises pack → install → run outside the repo on every `npm test`, so a green test run is a strong pre-publish signal.
