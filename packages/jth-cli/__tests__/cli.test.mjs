import { describe, it, expect, afterEach } from "vitest";
import { existsSync, unlinkSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { compile, deriveOutputPath } from "../src/compile.mjs";

// ── compile() with inline code ──────────────────────────────────────

describe("compile: inline code", () => {
  it("compiles inline code to a JS string", () => {
    const js = compile('1 2 + @;', { isCode: true });
    expect(typeof js).toBe("string");
    expect(js.length).toBeGreaterThan(0);
  });

  it("includes preamble imports by default", () => {
    const js = compile("1 2 +;", { isCode: true });
    expect(js).toContain('import { Stack, processN, registry } from "jth-runtime"');
    expect(js).toContain('import "jth-stdlib"');
    expect(js).toContain("const stack = new Stack()");
  });

  it("output contains processN calls", () => {
    const js = compile("1 2 +;", { isCode: true });
    expect(js).toContain("processN(stack,");
  });

  it("output contains registry.resolve for operators", () => {
    const js = compile("1 2 + @;", { isCode: true });
    expect(js).toContain('registry.resolve("+")');
    expect(js).toContain('registry.resolve("@")');
  });

  it("compiles number literals", () => {
    const js = compile("42;", { isCode: true });
    expect(js).toContain("42");
  });

  it("compiles string literals", () => {
    const js = compile('"hello world" @;', { isCode: true });
    expect(js).toContain('"hello world"');
  });

  it("compiles boolean literals", () => {
    const js = compile("true false;", { isCode: true });
    expect(js).toContain("true");
    expect(js).toContain("false");
  });

  it("compiles definitions correctly", () => {
    const js = compile("#[ dupe * ] :square;", { isCode: true });
    expect(js).toContain('registry.set("square"');
    expect(js).toContain('registry.resolve("dupe")');
    expect(js).toContain('registry.resolve("*")');
  });

  it("compiles value definitions correctly", () => {
    const js = compile("1 2 + ::sum;", { isCode: true });
    expect(js).toContain("const sum = stack.pop()");
    expect(js).toContain('registry.resolve("+")');
  });

  it("compiles import with .jth to .mjs rewriting", () => {
    const js = compile('::import "./math.jth" { square };', { isCode: true });
    expect(js).toContain('import { square } from "./math.mjs"');
    expect(js).not.toContain(".jth");
  });

  it("compiles export statements", () => {
    const js = compile("::export square cube;", { isCode: true });
    expect(js).toContain("export { square, cube }");
  });

  it("compiles block literals", () => {
    const js = compile('#[ "yes" ] #[ "no" ] true if;', { isCode: true });
    expect(js).toContain("((s) => processN(s,");
    expect(js).toContain('registry.resolve("if")');
  });

  it("compiles array literals", () => {
    const js = compile("[1 2 3] spread +;", { isCode: true });
    expect(js).toContain("[1, 2, 3]");
    expect(js).toContain('registry.resolve("spread")');
  });

  it("produced output is syntactically valid JavaScript (body)", () => {
    const js = compile("1 2 + @;", { isCode: true });
    // Strip import lines (new Function cannot parse ES module imports).
    // Validate only the executable body is syntactically correct.
    const body = js
      .split("\n")
      .filter((line) => !line.startsWith("import "))
      .join("\n");
    expect(() => new Function(`return (async () => { ${body} })`)).not.toThrow();
  });
});

// ── compile() with file I/O ─────────────────────────────────────────

describe("compile: file I/O", () => {
  const tmpFile = join(tmpdir(), "jth-cli-test-input.jth");
  const outFile = join(tmpdir(), "jth-cli-test-output.mjs");

  afterEach(() => {
    for (const f of [tmpFile, outFile]) {
      try { unlinkSync(f); } catch { /* ignore */ }
    }
  });

  it("reads source from a file", () => {
    writeFileSync(tmpFile, "1 2 +;", "utf-8");
    const js = compile(tmpFile);
    expect(js).toContain("processN(stack,");
    expect(js).toContain('registry.resolve("+")');
  });

  it("writes compiled output to a file", () => {
    writeFileSync(tmpFile, '"hello" @;', "utf-8");
    compile(tmpFile, { output: outFile });
    expect(existsSync(outFile)).toBe(true);
    const content = readFileSync(outFile, "utf-8");
    expect(content).toContain("processN(stack,");
    expect(content).toContain('registry.resolve("@")');
  });
});

// ── deriveOutputPath ────────────────────────────────────────────────

describe("deriveOutputPath", () => {
  it("converts .jth to .mjs", () => {
    const result = deriveOutputPath("program.jth");
    expect(result).toMatch(/program\.mjs$/);
  });

  it("preserves directory in output path", () => {
    const result = deriveOutputPath("/some/dir/program.jth");
    expect(result).toBe("/some/dir/program.mjs");
  });

  it("handles files without .jth extension", () => {
    const result = deriveOutputPath("script.txt");
    expect(result).toMatch(/script\.mjs$/);
  });
});
