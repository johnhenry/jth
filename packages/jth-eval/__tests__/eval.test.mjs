import { describe, it, expect } from "vitest";
import { op, variadic } from "jth-runtime";
import { evalJth } from "../src/eval.mjs";

describe("evalJth", () => {
  describe("basic evaluation", () => {
    it("evaluates a simple number", async () => {
      const result = await evalJth("42;");
      expect(result.value).toBe(42);
      expect(result.stack).toEqual([42]);
    });

    it("evaluates a string", async () => {
      const result = await evalJth('"hello";');
      expect(result.value).toBe("hello");
    });

    it("evaluates booleans", async () => {
      expect((await evalJth("true;")).value).toBe(true);
      expect((await evalJth("false;")).value).toBe(false);
    });

    it("evaluates null", async () => {
      const result = await evalJth("null;");
      expect(result.value).toBeNull();
    });

    it("returns undefined value for empty stack", async () => {
      const result = await evalJth("1 drop;");
      expect(result.value).toBeUndefined();
      expect(result.stack).toEqual([]);
    });

    it("evaluates multiple values", async () => {
      const result = await evalJth("1 2 3;");
      expect(result.stack).toEqual([1, 2, 3]);
      expect(result.value).toBe(3);
    });
  });

  describe("arithmetic", () => {
    it("adds two numbers", async () => {
      const result = await evalJth("1 2 +;");
      expect(result.value).toBe(3);
    });

    it("complex expression", async () => {
      const result = await evalJth("10 3 - 2 *;");
      expect(result.value).toBe(14);
    });

    it("word-form operators", async () => {
      const result = await evalJth("1 2 plus;");
      expect(result.value).toBe(3);
    });

    it("variadic sum", async () => {
      const result = await evalJth("1 2 3 4 5 Σ;");
      expect(result.value).toBe(15);
    });
  });

  describe("value injection", () => {
    it("injects a number value", async () => {
      const result = await evalJth("x;", { values: { x: 42 } });
      expect(result.value).toBe(42);
    });

    it("injects multiple values", async () => {
      const result = await evalJth("x y plus;", {
        values: { x: 10, y: 20 },
      });
      expect(result.value).toBe(30);
    });

    it("injects string values", async () => {
      const result = await evalJth("greeting;", {
        values: { greeting: "hello" },
      });
      expect(result.value).toBe("hello");
    });

    it("injects boolean values", async () => {
      const result = await evalJth("flag;", { values: { flag: true } });
      expect(result.value).toBe(true);
    });

    it("injects array values", async () => {
      const result = await evalJth("arr;", { values: { arr: [1, 2, 3] } });
      expect(result.value).toEqual([1, 2, 3]);
    });

    it("injected values can be used multiple times", async () => {
      const result = await evalJth("x x plus;", { values: { x: 5 } });
      expect(result.value).toBe(10);
    });
  });

  describe("custom operator injection", () => {
    it("injects a custom op(1) operator", async () => {
      const double = op(1)((x) => [x * 2]);
      const result = await evalJth("21 double;", {
        operators: { double },
      });
      expect(result.value).toBe(42);
    });

    it("injects a custom op(2) operator", async () => {
      const myAdd = op(2)((a, b) => [a + b + 1]);
      const result = await evalJth("10 20 my-add;", {
        operators: { "my-add": myAdd },
      });
      expect(result.value).toBe(31);
    });

    it("injects a variadic operator", async () => {
      const joinAll = variadic((...args) => [args.join("-")]);
      const result = await evalJth('"a" "b" "c" join-all;', {
        operators: { "join-all": joinAll },
      });
      expect(result.value).toBe("a-b-c");
    });
  });

  describe("stack pre-loading", () => {
    it("pre-loads the stack", async () => {
      const result = await evalJth("+;", { stack: [10, 20] });
      expect(result.value).toBe(30);
    });

    it("pre-loaded values persist with evaluated code", async () => {
      const result = await evalJth("3;", { stack: [1, 2] });
      expect(result.stack).toEqual([1, 2, 3]);
    });

    it("empty pre-load works", async () => {
      const result = await evalJth("42;", { stack: [] });
      expect(result.value).toBe(42);
    });
  });

  describe("output capture", () => {
    it("captures peek output", async () => {
      const result = await evalJth("42 peek;");
      expect(result.output).toBe("42");
      expect(result.value).toBe(42);
    });

    it("captures multiple peek outputs", async () => {
      const result = await evalJth("1 peek; 2 peek;");
      expect(result.output).toBe("1\n2");
    });

    it("empty output when no peek", async () => {
      const result = await evalJth("1 2 +;");
      expect(result.output).toBe("");
    });

    it("captureOutput: false does not capture", async () => {
      // Should not throw or capture
      const result = await evalJth("42;", { captureOutput: false });
      expect(result.output).toBe("");
    });
  });

  describe("timeout", () => {
    it("does not timeout for fast code", async () => {
      const result = await evalJth("1 2 +;", { timeout: 5000 });
      expect(result.value).toBe(3);
    });
  });

  describe("error handling", () => {
    it("throws on unknown operator", async () => {
      await expect(evalJth("1 nonexistent;")).rejects.toThrow(
        "Unknown operator"
      );
    });

    it("stack underflow produces NaN (no throw)", async () => {
      // jth's popN doesn't throw on empty stack — it returns undefined
      const result = await evalJth("+;");
      expect(result.value).toBeNaN();
    });
  });

  describe("definitions", () => {
    it("defines and uses an operator", async () => {
      const result = await evalJth("#[ dupe * ] :square; 5 square;");
      expect(result.value).toBe(25);
    });

    it("definitions are scoped and do not pollute global registry", async () => {
      await evalJth("#[ 1 ] :eval-test-unique-xyz;");
      // The global registry should not have this
      const { registry } = await import("jth-runtime");
      expect(registry.has("eval-test-unique-xyz")).toBe(false);
    });
  });

  describe("multi-statement programs", () => {
    it("evaluates multiple statements", async () => {
      const result = await evalJth("1 2; 3 4;");
      expect(result.stack).toEqual([1, 2, 3, 4]);
    });

    it("definitions used in later statements", async () => {
      const result = await evalJth("#[ 2 * ] :double; 21 double;");
      expect(result.value).toBe(42);
    });
  });

  describe("control flow", () => {
    it("if/else with true condition", async () => {
      const result = await evalJth('#[ "no" ] #[ "yes" ] true if;');
      expect(result.value).toBe("yes");
    });

    it("if/else with false condition", async () => {
      const result = await evalJth('#[ "no" ] #[ "yes" ] false if;');
      expect(result.value).toBe("no");
    });

    it("times loop", async () => {
      const result = await evalJth("0; #[ 1 + ] 5 times;");
      expect(result.value).toBe(5);
    });
  });

  describe("string operations", () => {
    it("string length", async () => {
      const result = await evalJth('"hello" len;');
      expect(result.value).toBe(5);
    });

    it("uppercase", async () => {
      const result = await evalJth('"hello" upper;');
      expect(result.value).toBe("HELLO");
    });
  });

  describe("array operations", () => {
    it("array literal and spread", async () => {
      const result = await evalJth("[1 2 3] ...;");
      expect(result.stack).toEqual([1, 2, 3]);
    });

    it("map over array", async () => {
      const result = await evalJth("[1 2 3] #[ 2 * ] map;");
      expect(result.value).toEqual([2, 4, 6]);
    });

    it("filter array", async () => {
      const result = await evalJth("[1 2 3 4 5] #[ 2 % 0 = ] filter;");
      expect(result.value).toEqual([2, 4]);
    });
  });
});
