import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import { tryOp, throwOp, isError } from "../src/error-handling.mjs";

describe("error-handling", () => {
  describe("tryOp", () => {
    it("executes block successfully and stack reflects result", () => {
      const s = new Stack();
      const block = (stack) => stack.push(42);
      s.push(block);
      tryOp(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("catches error and pushes Error onto stack", () => {
      const s = new Stack();
      const block = () => {
        throw new Error("oops");
      };
      s.push(block);
      tryOp(s);
      const result = s.toArray();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[0].message).toBe("oops");
    });

    it("wraps non-Error throws into Error", () => {
      const s = new Stack();
      const block = () => {
        throw "string error";
      };
      s.push(block);
      tryOp(s);
      const result = s.toArray();
      expect(result[0]).toBeInstanceOf(Error);
      expect(result[0].message).toBe("string error");
    });

    it("does nothing for non-function values", () => {
      const s = new Stack();
      s.push(42);
      tryOp(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("throwOp", () => {
    it("throws an error with the given message", () => {
      const s = new Stack();
      s.push("bad input");
      expect(() => throwOp(s)).toThrow("bad input");
    });

    it("converts non-string to string message", () => {
      const s = new Stack();
      s.push(404);
      expect(() => throwOp(s)).toThrow("404");
    });
  });

  describe("isError", () => {
    it("returns true for Error instances", () => {
      const s = new Stack();
      s.push(new Error("test"));
      isError(s);
      expect(s.toArray()).toEqual([true]);
    });

    it("returns false for non-Error values", () => {
      const s = new Stack();
      s.push("not an error");
      isError(s);
      expect(s.toArray()).toEqual([false]);
    });

    it("returns false for plain objects", () => {
      const s = new Stack();
      s.push({ message: "fake error" });
      isError(s);
      expect(s.toArray()).toEqual([false]);
    });
  });
});
