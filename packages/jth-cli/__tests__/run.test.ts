/**
 * Integration tests for `jth run` through the REAL built CLI (plain node,
 * no tsx): compile, bundle self-contained, spawn node, clean up.
 *
 * Requires a build (`npm run build`) — the root `npm test` script builds
 * first. Temp dirs live in the OS temp dir on purpose: bundled output must
 * run outside the monorepo tree.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "..", "dist", "bin", "jth.js");

function jth(args: string[], cwd: string) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 60_000,
  });
}

describe("jth run (built CLI, spawn path)", () => {
  let dir: string;

  beforeEach(() => {
    expect(
      existsSync(BIN),
      "dist/bin/jth.js missing — run `npm run build` first (root `npm test` does)"
    ).toBe(true);
    dir = mkdtempSync(join(tmpdir(), "jth-run-test-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("runs a .jth file: correct stdout and exit code 0", () => {
    const file = join(dir, "hello.jth");
    writeFileSync(file, '"hello from jth run" peek;', "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("hello from jth run");
  });

  it("writes nothing next to the user's source (temp file lives in os.tmpdir)", () => {
    const file = join(dir, "prog.jth");
    writeFileSync(file, "1 2 + peek;", "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).toBe(0);
    expect(readdirSync(dir)).toEqual(["prog.jth"]);
  });

  it("leaves no litter even when the program fails", () => {
    const file = join(dir, "bad.jth");
    writeFileSync(file, "1 no-such-op;", "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).not.toBe(0);
    expect(readdirSync(dir)).toEqual(["bad.jth"]);
  });

  it("runs inline code with -c", () => {
    const result = jth(["run", "-c", "6 7 * peek;"], dir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("42");
    expect(readdirSync(dir)).toEqual([]);
  });

  it("reports jth errors with source position and exits 1", () => {
    const file = join(dir, "err.jth");
    writeFileSync(file, "1 2 bogus-op;", "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown operator: bogus-op");
    expect(result.stderr).toMatch(/at \d+:\d+/);
  });

  it("relative .jth imports resolve next to the source file", () => {
    // Multi-file flow: compile the library unbundled (bare specifiers) so
    // the main program's bundling step inlines it once.
    const lib = join(dir, "lib.jth");
    writeFileSync(lib, "#[ dupe * ] :square;\n::export square;", "utf-8");
    const compiled = jth(["compile", "--no-bundle", lib], dir);
    expect(compiled.status).toBe(0);

    const main = join(dir, "main.jth");
    writeFileSync(
      main,
      '::import "./lib.jth" { square };\n7 square peek;',
      "utf-8"
    );
    const result = jth(["run", main], dir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("49");
  });

  it("rejects --no-bundle with a clear error instead of mis-parsing it as a filename (issue #46)", () => {
    const result = jth(["run", "--no-bundle"], dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--no-bundle is not supported for `jth run`");
    // No stray temp files, no attempt to read a file literally named "--no-bundle".
    expect(readdirSync(dir)).toEqual([]);
  });

  it("rejects --no-bundle even when a real file argument follows it (issue #46)", () => {
    const file = join(dir, "prog.jth");
    writeFileSync(file, "1 2 + peek;", "utf-8");
    const result = jth(["run", "--no-bundle", file], dir);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("--no-bundle is not supported for `jth run`");
  });
});

describe("jth compile (built CLI)", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "jth-compile-test-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("default output is a self-contained bundle runnable with plain node anywhere", () => {
    const file = join(dir, "prog.jth");
    writeFileSync(file, "20 22 + peek;", "utf-8");
    const out = join(dir, "prog.mjs");
    const compiled = jth(["compile", file, out], dir);
    expect(compiled.status).toBe(0);

    // Run from an unrelated directory with plain node — no jth packages
    // installed there, no tsx.
    const other = mkdtempSync(join(tmpdir(), "jth-elsewhere-"));
    try {
      const result = spawnSync(process.execPath, [out], {
        cwd: other,
        encoding: "utf-8",
        timeout: 60_000,
      });
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe("42");
    } finally {
      rmSync(other, { recursive: true, force: true });
    }
  });

  it("--no-bundle emits the bare-specifier form", () => {
    const file = join(dir, "prog.jth");
    writeFileSync(file, "1 2 +;", "utf-8");
    const out = join(dir, "bare.mjs");
    const compiled = jth(["compile", "--no-bundle", file, out], dir);
    expect(compiled.status).toBe(0);
    const js = readFileSync(out, "utf-8");
    expect(js).toContain('from "@johnhenry/jth-runtime"');
    expect(js).toContain('import "@johnhenry/jth-stdlib"');
  });

  it("--no-bundle to a different output directory rewrites relative ::import paths to resolve correctly (issue #45)", () => {
    // src/lib.jth compiles (in place) to src/lib.mjs. src/main.jth
    // ::imports "./lib.jth" (rewritten to "./lib.mjs") but is compiled
    // --no-bundle to a SEPARATE output directory (dist/main.mjs). The
    // emitted import specifier must be re-expressed relative to dist/, not
    // left as the naive "./lib.mjs" (which would resolve against dist/ and
    // silently hit whatever — or nothing — lives there instead of the real
    // compiled library next to the source).
    const srcDir = join(dir, "src");
    const distDir = join(dir, "dist");
    mkdirSync(srcDir, { recursive: true });
    mkdirSync(distDir, { recursive: true });

    const lib = join(srcDir, "lib.jth");
    writeFileSync(lib, "#[ dupe * ] :square;\n::export square;", "utf-8");
    // No explicit output -> defaults next to the source: src/lib.mjs.
    const libCompiled = jth(["compile", "--no-bundle", lib], dir);
    expect(libCompiled.status).toBe(0);
    const libOut = join(srcDir, "lib.mjs");
    expect(existsSync(libOut)).toBe(true);

    const main = join(srcDir, "main.jth");
    writeFileSync(main, '::import "./lib.jth" { square };\n7 square peek;', "utf-8");
    const mainOut = join(distDir, "main.mjs");
    const mainCompiled = jth(["compile", "--no-bundle", main, mainOut], dir);
    expect(mainCompiled.status).toBe(0);

    const mainJs = readFileSync(mainOut, "utf-8");
    // Must NOT be the naive, directory-blind "./lib.mjs".
    expect(mainJs).not.toContain('"./lib.mjs"');

    // Extract the rewritten specifier and confirm it actually resolves
    // (from dist/, where main.mjs lives) to the real compiled lib.mjs.
    const match = mainJs.match(/from\s+"([^"]*lib\.mjs)"/);
    expect(match).not.toBeNull();
    const resolved = resolve(distDir, match![1]);
    expect(resolved).toBe(libOut);
    expect(existsSync(resolved)).toBe(true);
  });
});
