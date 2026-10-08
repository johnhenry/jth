/**
 * `--sandbox` flag for `jth run` and `jth repl` (issue #50), driven through
 * the REAL built CLI (spawn path). Requires a build (root `npm test` builds).
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = resolve(__dirname, "..", "dist", "bin", "jth.js");

function jth(args: string[], cwd: string) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf-8", timeout: 60_000 });
}

/** Drive `jth repl ...`: send each line only after the previous output settles. */
function repl(args: string[], cwd: string, lines: string[]): Promise<{ stdout: string; stderr: string; status: number | null }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [BIN, "repl", ...args], { cwd });
    let stdout = "";
    let stderr = "";
    let sent = 0;
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`repl timed out. stdout=${stdout} stderr=${stderr}`));
    }, 30_000);
    const sendNext = () => {
      if (sent < lines.length) child.stdin.write(lines[sent++] + "\n");
      else child.stdin.write(".exit\n");
    };
    child.stdout.on("data", (d) => {
      stdout += d;
      // a prompt means the previous line has been fully handled
      if (stdout.endsWith("jth> ")) {
        stdout += ""; // no-op, keep for clarity
        setImmediate(sendNext);
      }
    });
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (status) => {
      clearTimeout(timer);
      resolvePromise({ stdout, stderr, status });
    });
    child.on("error", reject);
  });
}

describe("jth --sandbox (built CLI)", () => {
  let dir: string;
  beforeEach(() => {
    expect(existsSync(BIN), "dist/bin/jth.js missing — run `npm run build` first").toBe(true);
    dir = mkdtempSync(join(tmpdir(), "jth-sandbox-test-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  describe("jth run -c", () => {
    it("default (no flag) is unchanged: inline JS runs", () => {
      const r = jth(["run", "-c", "((console.log('inline-ran')));"], dir);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("inline-ran");
    });

    it("--sandbox rejects inline JS before anything runs", () => {
      const r = jth(["run", "-c", "((console.log('inline-ran')));", "--sandbox"], dir);
      expect(r.status).toBe(1);
      expect(r.stdout).not.toContain("inline-ran");
      expect(r.stderr).toContain("not allowed in sandbox");
    });

    it("--sandbox (bare flag) means restricted: pure stdlib works, final stack is printed", () => {
      const r = jth(["run", "-c", "1 2 + 3 *;", "--sandbox"], dir);
      expect(r.status).toBe(0);
      expect(r.stdout.trim()).toBe("9");
    });

    it("--sandbox=restricted blocks peek (I/O op)", () => {
      const r = jth(["run", "-c", '"x" peek;', "--sandbox=restricted"], dir);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("not allowed in sandbox");
      expect(r.stdout).not.toContain("x");
    });

    it("flag position does not matter (before -c)", () => {
      const r = jth(["run", "--sandbox", "-c", "2 3 *;"], dir);
      expect(r.status).toBe(0);
      expect(r.stdout.trim()).toBe("6");
    });

    it("--sandbox=bare blocks all stdlib operators", () => {
      const r = jth(["run", "-c", "1 2 +;", "--sandbox=bare"], dir);
      expect(r.status).toBe(1);
      expect(r.stderr).toContain("+");
    });

    it("--sandbox=<a,b,c> is an explicit allowlist", () => {
      const ok = jth(["run", "-c", '"hi" peek;', "--sandbox=peek"], dir);
      expect(ok.status).toBe(0);
      expect(ok.stdout).toContain("hi");
      const denied = jth(["run", "-c", "1 2 +;", "--sandbox=peek"], dir);
      expect(denied.status).toBe(1);
      expect(denied.stderr).toContain("not allowed in sandbox");
    });

    it("an empty --sandbox= value fails closed instead of running unsandboxed", () => {
      const r = jth(["run", "-c", "((console.log('inline-ran')));", "--sandbox="], dir);
      expect(r.status).toBe(1);
      expect(r.stdout).not.toContain("inline-ran");
      expect(r.stderr).toMatch(/--sandbox/);
    });

    it("sandboxed runs apply to files too, and write nothing next to the source", () => {
      const file = join(dir, "p.jth");
      writeFileSync(file, "((console.log('inline-ran')));", "utf-8");
      const r = jth(["run", file, "--sandbox"], dir);
      expect(r.status).toBe(1);
      expect(r.stdout).not.toContain("inline-ran");
      expect(readdirSync(dir)).toEqual(["p.jth"]);
    });

    it("sandboxed errors still carry source positions", () => {
      const r = jth(["run", "-c", "1 2 +;\nclear 3 +;", "--sandbox"], dir);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/at 2:\d+/);
    });
  });

  describe("jth repl", () => {
    it("--sandbox: pure ops work, inline JS is rejected, state persists", async () => {
      const r = await repl(["--sandbox"], dir, ["1 2 +;", "((console.log('inline-ran')));", "4 *;"]);
      expect(r.stdout).toContain("[ 3 ]");
      expect(r.stdout).toContain("[ 12 ]");
      expect(r.stdout).not.toContain("inline-ran");
      expect(r.stderr).toContain("not allowed in sandbox");
      expect(r.stdout).toMatch(/sandbox/i);
    });

    it("default REPL is unchanged: inline JS runs", async () => {
      const r = await repl([], dir, ["((console.log('inline-ran')));"]);
      expect(r.stdout).toContain("inline-ran");
    });

    it("an invalid --sandbox mode exits non-zero without starting the REPL", () => {
      const r = jth(["repl", "--sandbox="], dir);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/--sandbox/);
    });
  });

  it("compile rejects --sandbox explicitly", () => {
    const r = jth(["compile", "-c", "1 2 +;", "--sandbox"], dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("--sandbox is not supported for `jth compile`");
  });

  it("--help documents --sandbox", () => {
    const r = jth(["--help"], dir);
    expect(r.stdout).toContain("--sandbox");
  });
});
