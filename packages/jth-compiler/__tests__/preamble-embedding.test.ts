import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { transform } from "../src/transform.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Lives under the package so bare "@johnhenry/jth-*" imports resolve via the workspace.
const TMP_ROOT = join(__dirname, "..");

describe("compiled output does not install process-wide handlers when embedded (audit #28 item 4)", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  function compiledModule(src: string): { dir: string; file: string } {
    const dir = mkdtempSync(join(TMP_ROOT, ".tmp-preamble-"));
    dirs.push(dir);
    const file = join(dir, "prog.mjs");
    writeFileSync(file, transform(src, { preamble: true }), "utf-8");
    return { dir, file };
  }

  it("importing compiled bundles adds no uncaughtException listener and never stacks", async () => {
    const before = process.listenerCount("uncaughtException");
    const a = compiledModule('"a" peek;');
    const b = compiledModule('"b" peek;');
    await import(pathToFileURL(a.file).href);
    await import(pathToFileURL(b.file).href);
    expect(process.listenerCount("uncaughtException")).toBe(before);
  });

  it("run as the entry point, jth errors still print 'Name at line:col: message' and exit 1", () => {
    const { file } = compiledModule("1 2 +;\n3 nonexistentop;");
    const r = spawnSync(process.execPath, [file], { encoding: "utf-8", timeout: 30_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("JthRuntimeError at 2:");
    expect(r.stderr).toContain("Unknown operator: nonexistentop");
  });

  it("run as the entry point, a non-jth error with a .line property is not swallowed into a jth report", () => {
    const { file } = compiledModule("((setTimeout(() => { const e = new Error('third-party'); e.line = 7; throw e; }, 0)));\n5 _;");
    const r = spawnSync(process.execPath, [file], { encoding: "utf-8", timeout: 30_000 });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("third-party");
    expect(r.stderr).not.toMatch(/^Error at 7:/m);
  });
});
