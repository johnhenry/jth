import { describe, it, expect, afterEach } from "vitest";
import { evalJth } from "../src/eval.ts";
import { JthContext } from "../src/context.ts";

describe("Sandbox modes", () => {
  describe("sandbox: false (default, full access)", () => {
    it("all stdlib operators available", async () => {
      const result = await evalJth("1 2 +;", { sandbox: false });
      expect(result.value).toBe(3);
    });

    it("map available", async () => {
      const result = await evalJth("[1 2 3] #[ 2 * ] map;");
      expect(result.value).toEqual([2, 4, 6]);
    });
  });

  describe('sandbox: true (bare mode)', () => {
    it("blocks all stdlib operators", async () => {
      await expect(
        evalJth("1 2 +;", { sandbox: true })
      ).rejects.toThrow();
    });

    it("allows injected values", async () => {
      const result = await evalJth("x;", {
        sandbox: true,
        values: { x: 42 },
      });
      expect(result.value).toBe(42);
    });

    it("allows injected operators", async () => {
      const { op } = await import("@johnhenry/jth-runtime");
      const double = op(1)((x) => [x * 2]);
      const result = await evalJth("21 double;", {
        sandbox: true,
        operators: { double },
        stack: [],
      });
      expect(result.value).toBe(42);
    });

    it("still pushes literals", async () => {
      const result = await evalJth("42;", { sandbox: true });
      expect(result.value).toBe(42);
    });

    it("blocks stdlib even with complex expressions", async () => {
      await expect(
        evalJth("[1 2 3] #[ 2 * ] map;", { sandbox: true })
      ).rejects.toThrow();
    });
  });

  describe('sandbox: "restricted"', () => {
    it("allows basic arithmetic", async () => {
      const result = await evalJth("1 2 +;", { sandbox: "restricted" });
      expect(result.value).toBe(3);
    });

    it("allows string ops", async () => {
      const result = await evalJth('"hello" upper;', {
        sandbox: "restricted",
      });
      expect(result.value).toBe("HELLO");
    });

    it("allows control flow", async () => {
      const result = await evalJth('#[ "yes" ] true if;', {
        sandbox: "restricted",
      });
      expect(result.value).toBe("yes");
    });

    it("allows map (pure higher-order ops)", async () => {
      const result = await evalJth("[1 2 3] #[ 2 * ] map;", {
        sandbox: "restricted",
      });
      expect(result.value).toEqual([2, 4, 6]);
    });

    it("blocks the console I/O op `peek` with OP_NOT_ALLOWED", async () => {
      await expect(
        evalJth('"hi" peek;', { sandbox: "restricted" })
      ).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
        message: expect.stringContaining("peek"),
      });
    });

    it("blocks `peek-all` with OP_NOT_ALLOWED", async () => {
      await expect(
        evalJth("1 2 peek-all;", { sandbox: "restricted" })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it("without sandbox, peek is allowed (control test)", async () => {
      const result = await evalJth('"hi" peek;', { sandbox: false });
      expect(result.output).toBe("hi");
    });

    it("blocks dynamic pattern ops (not enumerable into the allowlist)", async () => {
      // "3+" resolves via a dynamic registry pattern in open mode...
      const open = await evalJth("4 3+;", { sandbox: false });
      expect(open.value).toBe(7);
      // ...but restricted mode default-denies anything not statically named.
      await expect(
        evalJth("4 3+;", { sandbox: "restricted" })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it("blocks inline JS at compile time with OP_NOT_ALLOWED", async () => {
      // Control: inline JS runs in open mode.
      const open = await evalJth("((s) => { s.push(42); });", {
        sandbox: false,
      });
      expect(open.value).toBe(42);
      await expect(
        evalJth("((s) => { s.push(42); });", { sandbox: "restricted" })
      ).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
        message: expect.stringContaining("Inline JS"),
      });
    });

    it("blocked programs do not execute at all (no partial effects)", async () => {
      // The inline JS appears after a valid statement; compile-time
      // rejection means even the first statement must not run.
      let leaked = false;
      const { op } = await import("@johnhenry/jth-runtime");
      const markLeak = op(0)(() => {
        leaked = true;
        return [];
      });
      await expect(
        evalJth("mark-leak; ((s) => s.push(1));", {
          sandbox: "restricted",
          operators: { "mark-leak": markLeak },
        })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
      expect(leaked).toBe(false);
    });
  });

  describe("inline JS is blocked in every sandbox mode", () => {
    it("sandbox: true blocks inline JS", async () => {
      await expect(
        evalJth("((s) => s.push(1));", { sandbox: true })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it("sandbox: string[] blocks inline JS", async () => {
      await expect(
        evalJth("((s) => s.push(1));", { sandbox: ["+"] })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it("JthContext restricted mode blocks inline JS", async () => {
      const ctx = new JthContext({ sandbox: "restricted" });
      await expect(ctx.eval("((s) => s.push(1));")).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
      ctx.dispose();
    });
  });

  describe("JthContext restricted mode", () => {
    it("allows pure ops, blocks peek", async () => {
      const ctx = new JthContext({ sandbox: "restricted" });
      const result = await ctx.eval("2 3 +;");
      expect(result.value).toBe(5);
      await expect(ctx.eval("peek;")).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
      ctx.dispose();
    });
  });

  describe("sandbox: string[] (explicit allowlist)", () => {
    it("allows listed operators", async () => {
      const result = await evalJth("1 2 +;", { sandbox: ["+", "-"] });
      expect(result.value).toBe(3);
    });

    it("blocks unlisted operators", async () => {
      await expect(
        evalJth("1 2 *;", { sandbox: ["+", "-"] })
      ).rejects.toThrow();
    });

    it("allows injected values alongside allowlist", async () => {
      const result = await evalJth("x y +;", {
        sandbox: ["+"],
        values: { x: 10, y: 20 },
      });
      expect(result.value).toBe(30);
    });

    it("allowlist with dupe and swap", async () => {
      const result = await evalJth("5 dupe +;", {
        sandbox: ["dupe", "+"],
      });
      expect(result.value).toBe(10);
    });
  });

  describe("::name value-definitions are blocked in every sandbox mode (issue #49)", () => {
    // ::name previously compiled to an unconditional `globalThis[name] =
    // s.pop()` write (mid-statement) that was never checked by
    // forbidInlineJS or the operator allowlist, and a terminal-position
    // `const <name> = stack.pop()` that could shadow the runtime's
    // `registry` binding for the rest of the compiled program. Both must
    // be rejected at compile time in every sandbox mode.

    afterEach(() => {
      delete (globalThis as any).__jthPoc;
    });

    it("sandbox: true blocks mid-statement ::name (globalThis write)", async () => {
      await expect(
        evalJth('"pwned" ::__jthPoc 1;', { sandbox: true })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
      expect((globalThis as any).__jthPoc).toBeUndefined();
    });

    it("sandbox: true blocks terminal-position ::name", async () => {
      await expect(
        evalJth("42 ::x;", { sandbox: true })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it('sandbox: "restricted" blocks mid-statement ::name (globalThis write)', async () => {
      await expect(
        evalJth('"pwned" ::__jthPoc 1;', { sandbox: "restricted" })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
      expect((globalThis as any).__jthPoc).toBeUndefined();
    });

    it('sandbox: "restricted" blocks a ::name that would shadow `registry`', async () => {
      // Previously: compiling this shadowed the `registry` parameter for
      // the rest of the program, breaking subsequent allowlist checks
      // with "registry.resolve is not a function" instead of a clean
      // compile-time rejection.
      await expect(
        evalJth('{ "a" 1 } ::registry;\n2 3 +;', { sandbox: "restricted" })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
    });

    it("sandbox: string[] allowlist blocks ::name", async () => {
      await expect(
        evalJth('"pwned" ::__jthPoc 1;', { sandbox: ["+", "-"] })
      ).rejects.toMatchObject({ code: "OP_NOT_ALLOWED" });
      expect((globalThis as any).__jthPoc).toBeUndefined();
    });

    it("JthContext restricted mode blocks ::name", async () => {
      const ctx = new JthContext({ sandbox: "restricted" });
      await expect(ctx.eval('"pwned" ::__jthPoc 1;')).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
      expect((globalThis as any).__jthPoc).toBeUndefined();
      ctx.dispose();
    });

    it("control: ::name still works in full-access (sandbox: false) mode", async () => {
      await evalJth('"trusted" ::__jthPoc 1;', { sandbox: false });
      expect((globalThis as any).__jthPoc).toBe("trusted");
    });
  });

  describe("JthContext with sandbox", () => {
    it("bare sandbox blocks stdlib", async () => {
      const ctx = new JthContext({ sandbox: true });
      await expect(ctx.eval("1 2 +;")).rejects.toThrow();
      ctx.dispose();
    });

    it("bare sandbox allows defineOp", async () => {
      const ctx = new JthContext({ sandbox: true });
      ctx.defineOp("add", 2, (a, b) => a + b);
      const result = await ctx.eval("1 2 add;");
      expect(result.value).toBe(3);
      ctx.dispose();
    });

    it("allowlist sandbox works in context", async () => {
      const ctx = new JthContext({ sandbox: ["+", "-", "dupe"] });
      const result = await ctx.eval("5 dupe +;");
      expect(result.value).toBe(10);
      await expect(ctx.eval("2 3 *;")).rejects.toThrow();
      ctx.dispose();
    });
  });
});
