import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  ifOp,
  when,
  dropWhen,
  keepIf,
  dropIf,
  timesOp,
  loop,
} from "../src/control-flow.mjs";

describe("control-flow", () => {
  describe("ifOp", () => {
    it("executes trueBlock when condition is truthy", () => {
      const s = new Stack();
      const falseBlock = (stack) => stack.push("no");
      const trueBlock = (stack) => stack.push("yes");
      s.push(falseBlock, trueBlock, 1);
      ifOp(s);
      expect(s.toArray()).toEqual(["yes"]);
    });

    it("executes falseBlock when condition is falsy", () => {
      const s = new Stack();
      const falseBlock = (stack) => stack.push("no");
      const trueBlock = (stack) => stack.push("yes");
      s.push(falseBlock, trueBlock, 0);
      ifOp(s);
      expect(s.toArray()).toEqual(["no"]);
    });

    it("does nothing if block is not a function", () => {
      const s = new Stack();
      s.push("fallback", "primary", 1);
      ifOp(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("when", () => {
    it("keeps value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      when(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("drops value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      when(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps other stack items when condition is truthy", () => {
      const s = new Stack();
      s.push(10, 42, 1);
      when(s);
      expect(s.toArray()).toEqual([10, 42]);
    });
  });

  describe("dropWhen (bug fix)", () => {
    it("drops value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      dropWhen(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      dropWhen(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("BUG FIX: only drops in true branch, not both", () => {
      const s = new Stack();
      s.push(10, 42, false);
      dropWhen(s);
      // Should keep 42 because condition is falsy
      expect(s.toArray()).toEqual([10, 42]);
    });

    it("drops value and preserves rest when condition is truthy", () => {
      const s = new Stack();
      s.push(10, 42, true);
      dropWhen(s);
      expect(s.toArray()).toEqual([10]);
    });
  });

  describe("keepIf", () => {
    it("keeps value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      keepIf(s);
      expect(s.toArray()).toEqual([42]);
    });

    it("drops value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      keepIf(s);
      expect(s.toArray()).toEqual([]);
    });
  });

  describe("dropIf", () => {
    it("drops value when condition is truthy", () => {
      const s = new Stack();
      s.push(42, 1);
      dropIf(s);
      expect(s.toArray()).toEqual([]);
    });

    it("keeps value when condition is falsy", () => {
      const s = new Stack();
      s.push(42, 0);
      dropIf(s);
      expect(s.toArray()).toEqual([42]);
    });
  });

  describe("timesOp", () => {
    it("executes block N times", () => {
      const s = new Stack();
      s.push(0);
      const block = (stack) => {
        const val = stack.pop();
        stack.push(val + 1);
      };
      s.push(block, 3);
      timesOp(s);
      expect(s.toArray()).toEqual([3]);
    });

    it("executes block 0 times does nothing", () => {
      const s = new Stack();
      s.push(42);
      const block = (stack) => stack.push(99);
      s.push(block, 0);
      timesOp(s);
      expect(s.toArray()).toEqual([42]);
    });
  });

  describe("loop", () => {
    it("executes block configured number of times", () => {
      const s = new Stack();
      s.push(0);
      const block = (stack) => {
        const val = stack.pop();
        stack.push(val + 10);
      };
      s.push(block);
      loop(5)(s);
      expect(s.toArray()).toEqual([50]);
    });
  });
});
