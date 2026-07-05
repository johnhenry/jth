# Publishing jth to npm

The monorepo publishes nine packages: `jth-types`, `jth-runtime`, `jth-compiler`, `jth-stdlib`, `jth-repl`, `jth-eval`, `jth-html`, `jth-ai`, and the CLI **`jth-lang`** (directory `packages/jth-cli`, binary `jth`). All are published together at the same version from the workspace root.

## One-time setup

Choose one of:

**A. CI publishing (recommended)** — set the `NPM_TOKEN` repository secret:

1. Create an npm automation token: <https://www.npmjs.com/settings/~/tokens> → *Generate New Token* → **Automation** (bypasses 2FA for CI).
2. Add it to the GitHub repo: *Settings → Secrets and variables → Actions → New repository secret*, name `NPM_TOKEN`.

**B. Local publishing** — log in once on your machine:

```bash
npm login
```

## Release flow (CI)

1. Make sure `main` is green and versions are bumped (all packages share one version; bump every `packages/*/package.json`, the root, and the inter-package `^x.y.z` ranges, then `npm install` to sync the lockfile).
2. Create and publish a GitHub release (tag e.g. `v0.4.0`):

   ```bash
   gh release create v0.4.0 --title "v0.4.0" --generate-notes
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
npm view jth-lang version
npx -y jth-lang --help          # or: npm i -g jth-lang && jth --help
```

## Deprecating the old package names (optional)

The CLI used to be planned/published as `jth-cli`. If old placeholder packages exist under your account, deprecate them so users are redirected:

```bash
npm deprecate jth-cli@"<=0.1.0" "Renamed to jth-lang"
# and, if desired, the other legacy placeholders:
npm deprecate jth-core@"<=0.1.0" "Superseded by the jth-lang toolchain"
npm deprecate jth-tools@"<=0.1.0" "Superseded by the jth-lang toolchain"
npm deprecate jth-stats@"<=0.1.0" "Superseded by the jth-lang toolchain"
```

## Notes

- The npm name `jth` is owned by another user; the CLI is `jth-lang`, but the installed binary is still `jth`.
- `jth-ai` is a JS-only helper library (registers no jth words); it publishes like the rest.
- The smoke test (`test/smoke/pack-install.test.ts`) already exercises pack → install → run outside the repo on every `npm test`, so a green test run is a strong pre-publish signal.
