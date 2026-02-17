import { describe, it, expect, beforeEach } from "vitest";
import { JthContext } from "../src/context.mjs";

describe("JthContext", () => {
  let ctx;

  beforeEach(() => {
    ctx = new JthContext();
  });

  describe("basic evaluation", () => {
    it("evaluates simple expressions", async () => {
      const result = await ctx.eval("1 2 +;");
      expect(result.value).toBe(3);
    });

    it("returns stack and value", async () => {
      const result = await ctx.eval("1 2 3;");
      expect(result.stack).toEqual([1, 2, 3]);
      expect(result.value).toBe(3);
    });
  });

  describe("persistent state", () => {
    it("accumulates stack across evaluations", async () => {
      await ctx.eval("1 2 3;");
      await ctx.eval("+;"); // 2 + 3 = 5
      const result = await ctx.eval("+;"); // 1 + 5 = 6
      expect(result.value).toBe(6);
    });

    it("definitions persist across evaluations", async () => {
      await ctx.eval("#[ dupe * ] :square;");
      const result = await ctx.eval("7 square;");
      expect(result.value).toBe(49);
    });

    it("stack state carries between evals", async () => {
      await ctx.eval("10;");
      await ctx.eval("20;");
      const result = await ctx.eval("+;");
      expect(result.value).toBe(30);
    });
  });

  describe("define()", () => {
    it("defines a number value", async () => {
      ctx.define("tax-rate", 0.08);
      const result = await ctx.eval("100 tax-rate *;");
      expect(result.value).toBe(8);
    });

    it("defines a string value", async () => {
      ctx.define("greeting", "hello");
      const result = await ctx.eval("greeting;");
      expect(result.value).toBe("hello");
    });

    it("defines a boolean value", async () => {
      ctx.define("flag", true);
      const result = await ctx.eval("flag;");
      expect(result.value).toBe(true);
    });

    it("defines an array value", async () => {
      ctx.define("data", [1, 2, 3]);
      const result = await ctx.eval("data;");
      expect(result.value).toEqual([1, 2, 3]);
    });

    it("defined values can be used with operators", async () => {
      ctx.define("x", 10);
      ctx.define("y", 20);
      const result = await ctx.eval("x y +;");
      expect(result.value).toBe(30);
    });
  });

  describe("defineOp()", () => {
    it("defines a unary operator", async () => {
      ctx.defineOp("double", 1, (x) => x * 2);
      const result = await ctx.eval("21 double;");
      expect(result.value).toBe(42);
    });

    it("defines a binary operator", async () => {
      ctx.defineOp("avg", 2, (a, b) => (a + b) / 2);
      const result = await ctx.eval("10 20 avg;");
      expect(result.value).toBe(15);
    });

    it("custom operator works with stdlib operators", async () => {
      ctx.defineOp("triple", 1, (x) => x * 3);
      const result = await ctx.eval("5 triple 1 +;");
      expect(result.value).toBe(16);
    });
  });

  describe("stack manipulation", () => {
    it("push() adds values", () => {
      ctx.push(1, 2, 3);
      expect(ctx.toArray()).toEqual([1, 2, 3]);
    });

    it("pop() removes and returns top", () => {
      ctx.push(1, 2, 3);
      expect(ctx.pop()).toBe(3);
      expect(ctx.toArray()).toEqual([1, 2]);
    });

    it("peek() returns top without removing", () => {
      ctx.push(1, 2, 3);
      expect(ctx.peek()).toBe(3);
      expect(ctx.toArray()).toEqual([1, 2, 3]);
    });

    it("clear() empties the stack", () => {
      ctx.push(1, 2, 3);
      ctx.clear();
      expect(ctx.toArray()).toEqual([]);
    });

    it("toArray() returns copy", () => {
      ctx.push(1, 2, 3);
      const arr = ctx.toArray();
      arr.push(4);
      expect(ctx.toArray()).toEqual([1, 2, 3]);
    });

    it("length returns stack size", () => {
      ctx.push(1, 2, 3);
      expect(ctx.length).toBe(3);
    });

    it("push then eval continues from pushed state", async () => {
      ctx.push(10, 20);
      const result = await ctx.eval("+;");
      expect(result.value).toBe(30);
    });

    it("eval then pop works", async () => {
      await ctx.eval("1 2 3;");
      expect(ctx.pop()).toBe(3);
      expect(ctx.pop()).toBe(2);
      expect(ctx.pop()).toBe(1);
    });
  });

  describe("output capture", () => {
    it("captures peek output", async () => {
      const result = await ctx.eval("42 peek;");
      expect(result.output).toBe("42");
    });

    it("each eval has independent output", async () => {
      const r1 = await ctx.eval("1 peek;");
      ctx.clear();
      const r2 = await ctx.eval("2 peek;");
      expect(r1.output).toBe("1");
      expect(r2.output).toBe("2");
    });
  });

  describe("dispose()", () => {
    it("prevents further eval after dispose", async () => {
      ctx.dispose();
      await expect(ctx.eval("1;")).rejects.toThrow("disposed");
    });

    it("prevents push after dispose", () => {
      ctx.dispose();
      expect(() => ctx.push(1)).toThrow("disposed");
    });

    it("prevents pop after dispose", () => {
      ctx.dispose();
      expect(() => ctx.pop()).toThrow("disposed");
    });

    it("prevents peek after dispose", () => {
      ctx.dispose();
      expect(() => ctx.peek()).toThrow("disposed");
    });

    it("prevents clear after dispose", () => {
      ctx.dispose();
      expect(() => ctx.clear()).toThrow("disposed");
    });

    it("prevents toArray after dispose", () => {
      ctx.dispose();
      expect(() => ctx.toArray()).toThrow("disposed");
    });

    it("prevents define after dispose", () => {
      ctx.dispose();
      expect(() => ctx.define("x", 1)).toThrow("disposed");
    });

    it("prevents defineOp after dispose", () => {
      ctx.dispose();
      expect(() => ctx.defineOp("x", 1, (a) => a)).toThrow("disposed");
    });
  });

  describe("no global pollution", () => {
    it("definitions do not leak to global registry", async () => {
      await ctx.eval("#[ 1 ] :ctx-test-unique-abc;");
      const { registry } = await import("jth-runtime");
      expect(registry.has("ctx-test-unique-abc")).toBe(false);
    });

    it("define() does not leak to global registry", async () => {
      ctx.define("ctx-test-unique-def", 42);
      const { registry } = await import("jth-runtime");
      expect(registry.has("ctx-test-unique-def")).toBe(false);
    });

    it("two contexts are independent", async () => {
      const ctx2 = new JthContext();
      ctx.define("x", 10);
      ctx2.define("x", 20);
      const r1 = await ctx.eval("x;");
      const r2 = await ctx2.eval("x;");
      expect(r1.value).toBe(10);
      expect(r2.value).toBe(20);
      ctx2.dispose();
    });
  });
});
