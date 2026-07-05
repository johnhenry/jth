/**
 * Integration tests for `jth run` through the REAL CLI spawn path:
 * compile to a temp .mjs, spawn node, inherit stdio, clean up.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "..", "bin", "jth.ts");
// Temp dirs live inside the repo tree: compiled output currently imports
// bare "jth-runtime"/"jth-stdlib" specifiers, which only resolve against
// the monorepo's node_modules (see #17 for the portability story).
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

function jth(args: string[], cwd: string) {
  return spawnSync(process.execPath, ["--import", "tsx", BIN, ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 60_000,
  });
}

describe("jth run (real CLI spawn path)", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(REPO_ROOT, ".jth-run-test-"));
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

  it("cleans up the temp .mjs written next to the source", () => {
    const file = join(dir, "prog.jth");
    writeFileSync(file, "1 2 + peek;", "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).toBe(0);
    // run() writes .jth-run-<hex>.mjs next to the source and removes it
    // in a finally block — nothing but the source may remain.
    expect(readdirSync(dir)).toEqual(["prog.jth"]);
  });

  it("cleans up the temp .mjs even when the program fails", () => {
    const file = join(dir, "bad.jth");
    writeFileSync(file, "1 no-such-op;", "utf-8");
    const result = jth(["run", file], dir);
    expect(result.status).not.toBe(0);
    expect(readdirSync(dir)).toEqual(["bad.jth"]);
  });

  it("runs inline code with -c (temp file in cwd, cleaned up)", () => {
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
    // lib.jth compiles to lib.mjs; main.jth imports it by relative path.
    const lib = join(dir, "lib.jth");
    writeFileSync(lib, "#[ dupe * ] :square;\n::export square;", "utf-8");
    const compiled = jth(["compile", lib], dir);
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
});
