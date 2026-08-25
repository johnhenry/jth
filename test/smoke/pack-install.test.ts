/**
 * SLOW smoke test: prove @johnhenry/jth is actually installable and usable
 * outside the monorepo.
 *
 * Flow: `npm pack` @johnhenry/jth and its workspace dependencies into a
 * temp dir OUTSIDE the repo, `npm install` the tarballs there (the tarball
 * versions satisfy each other's version ranges, so nothing @johnhenry/jth-*
 * is fetched from the registry), then run the installed `jth` binary on a
 * hello program with plain node.
 *
 * Requires a build (root `npm test` builds first) and network access for
 * @johnhenry/jth's third-party dependency (esbuild).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

// @johnhenry/jth plus every @johnhenry/jth-* package in its dependency
// closure. These are workspace DIRECTORY names under packages/, not npm
// package names (npm pack runs with cwd = packages/<dir>).
const PACKAGES = [
  "jth-types",
  "jth-runtime",
  "jth-compiler",
  "jth-stdlib",
  "jth-repl",
  "jth-cli", // directory name; the package inside is "@johnhenry/jth" (renamed from jth-lang, itself renamed from jth-cli)
];

const INSTALL_TIMEOUT = 300_000;

function sh(cmd: string, args: string[], cwd: string) {
  return spawnSync(cmd, args, { cwd, encoding: "utf-8", timeout: INSTALL_TIMEOUT });
}

describe("smoke: npm pack + install + run outside the repo", () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "jth-smoke-"));
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it(
    "packs, installs, and runs `jth run hello.jth` from a clean directory",
    () => {
      // 1. Pack each workspace package into the temp dir.
      for (const pkg of PACKAGES) {
        const result = sh("npm", ["pack", "--pack-destination", dir], join(REPO_ROOT, "packages", pkg));
        expect(result.status, `npm pack failed for ${pkg}: ${result.stderr}`).toBe(0);
      }
      const tarballs = readdirSync(dir).filter((f) => f.endsWith(".tgz"));
      expect(tarballs.length).toBe(PACKAGES.length);

      // 2. Install the tarballs into a fresh project.
      const init = sh("npm", ["init", "-y"], dir);
      expect(init.status).toBe(0);
      const install = sh(
        "npm",
        ["install", "--no-audit", "--no-fund", ...tarballs.map((t) => `./${t}`)],
        dir
      );
      expect(install.status, `npm install failed: ${install.stderr}`).toBe(0);

      // 3. Run a hello program via the installed binary (plain node stack;
      //    tsx is not installed here).
      writeFileSync(join(dir, "hello.jth"), '"Hello from installed jth!" peek;', "utf-8");
      const jthBin = join(dir, "node_modules", ".bin", "jth");
      const run = sh(jthBin, ["run", "hello.jth"], dir);
      expect(run.status, `jth run failed: ${run.stderr}`).toBe(0);
      expect(run.stdout.trim()).toBe("Hello from installed jth!");

      // 4. `jth compile` from the installed CLI produces a self-contained
      //    bundle runnable with plain node from yet another directory.
      const compile = sh(jthBin, ["compile", "hello.jth", "out.mjs"], dir);
      expect(compile.status, `jth compile failed: ${compile.stderr}`).toBe(0);
      const elsewhere = mkdtempSync(join(tmpdir(), "jth-smoke-elsewhere-"));
      try {
        const node = sh(process.execPath, [join(dir, "out.mjs")], elsewhere);
        expect(node.status).toBe(0);
        expect(node.stdout.trim()).toBe("Hello from installed jth!");
      } finally {
        rmSync(elsewhere, { recursive: true, force: true });
      }

      // 5. Version sanity: the installed binary reports the package version.
      const version = sh(jthBin, ["--version"], dir);
      expect(version.status).toBe(0);
      expect(version.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    },
    INSTALL_TIMEOUT
  );
});
