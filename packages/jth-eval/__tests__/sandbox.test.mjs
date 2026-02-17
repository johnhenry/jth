import { describe, it, expect } from "vitest";
import { evalJth } from "../src/eval.mjs";
import { JthContext } from "../src/context.mjs";

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
      const { op } = await import("jth-runtime");
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
