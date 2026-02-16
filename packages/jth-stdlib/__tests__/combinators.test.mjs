import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import { each, fanout, zip, compose } from "../src/combinators.mjs";

describe("combinators", () => {
  describe("zip", () => {
    it("pairs two arrays element-wise", () => {
      const s = new Stack();
      s.push([1, 2, 3], ["a", "b", "c"]);
      zip(s);
      expect(s.toArray()).toEqual([
        [
          [1, "a"],
          [2, "b"],
          [3, "c"],
        ],
      ]);
    });

    it("handles arrays of different lengths (truncates to shorter)", () => {
      const s = new Stack();
      s.push([1, 2], ["a", "b", "c"]);
      zip(s);
      expect(s.toArray()).toEqual([
        [
          [1, "a"],
          [2, "b"],
        ],
      ]);
    });

    it("returns empty array when one input is empty", () => {
      const s = new Stack();
      s.push([], [1, 2, 3]);
      zip(s);
      expect(s.toArray()).toEqual([[]]);
    });

    it("preserves rest of stack", () => {
      const s = new Stack();
      s.push(99, [1, 2], ["a", "b"]);
      zip(s);
      expect(s.toArray()).toEqual([
        99,
        [
          [1, "a"],
          [2, "b"],
        ],
      ]);
    });
  });

  describe("compose", () => {
    it("creates a new block from two blocks", () => {
      const s = new Stack();
      const double = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      const inc = (stack) => {
        const v = stack.pop();
        stack.push(v + 1);
      };
      s.push(double, inc);
      compose(s);
      // Now stack has a composed function: double then inc
      const composed = s.pop();
      s.push(5);
      composed(s);
      expect(s.toArray()).toEqual([11]); // (5 * 2) + 1 = 11
    });

    it("composes in correct order (first popped = second to run)", () => {
      const s = new Stack();
      const addExclaim = (stack) => {
        const v = stack.pop();
        stack.push(v + "!");
      };
      const wrap = (stack) => {
        const v = stack.pop();
        stack.push("[" + v + "]");
      };
      // Stack: addExclaim (bottom) -> wrap (top)
      // compose pops wrap then addExclaim => runs addExclaim first, wrap second
      s.push(addExclaim, wrap);
      compose(s);
      const composed = s.pop();
      s.push("hi");
      composed(s);
      expect(s.toArray()).toEqual(["[hi!]"]); // addExclaim first, then wrap
    });

    it("preserves rest of stack", () => {
      const s = new Stack();
      const noop1 = (stack) => {};
      const noop2 = (stack) => {};
      s.push(42, noop1, noop2);
      compose(s);
      expect(s.length).toBe(2); // 42 + composed block
      const items = s.toArray();
      expect(items[0]).toBe(42);
      expect(typeof items[1]).toBe("function");
    });
  });

  describe("each", () => {
    it("applies block to each item on the stack", () => {
      const s = new Stack();
      s.push(1, 2, 3);
      const double = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      s.push(double);
      each(s);
      expect(s.toArray()).toEqual([2, 4, 6]);
    });

    it("works with a single item", () => {
      const s = new Stack();
      s.push(10);
      const inc = (stack) => {
        const v = stack.pop();
        stack.push(v + 1);
      };
      s.push(inc);
      each(s);
      expect(s.toArray()).toEqual([11]);
    });

    it("handles empty stack (no items to process)", () => {
      const s = new Stack();
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      s.push(block);
      each(s);
      expect(s.toArray()).toEqual([]);
    });

    it("block can produce multiple results per item", () => {
      const s = new Stack();
      s.push(1, 2);
      const dupBlock = (stack) => {
        const v = stack.pop();
        stack.push(v, v);
      };
      s.push(dupBlock);
      each(s);
      // Each item duplicated
      expect(s.toArray()).toEqual([1, 1, 2, 2]);
    });
  });

  describe("fanout", () => {
    it("runs value through multiple blocks", () => {
      const s = new Stack();
      s.push(10);
      const double = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      const inc = (stack) => {
        const v = stack.pop();
        stack.push(v + 1);
      };
      s.push(double, inc);
      fanout(s);
      // 10 through double => 20, 10 through inc => 11
      expect(s.toArray()).toEqual([20, 11]);
    });

    it("works with a single block", () => {
      const s = new Stack();
      s.push(5);
      const square = (stack) => {
        const v = stack.pop();
        stack.push(v * v);
      };
      s.push(square);
      fanout(s);
      expect(s.toArray()).toEqual([25]);
    });

    it("preserves value semantics (each block gets fresh copy)", () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      const getLen = (stack) => {
        const arr = stack.pop();
        stack.push(arr.length);
      };
      const getFirst = (stack) => {
        const arr = stack.pop();
        stack.push(arr[0]);
      };
      s.push(getLen, getFirst);
      fanout(s);
      expect(s.toArray()).toEqual([3, 1]);
    });

    it("handles three blocks", () => {
      const s = new Stack();
      s.push(6);
      const half = (stack) => {
        const v = stack.pop();
        stack.push(v / 2);
      };
      const double = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      const negate = (stack) => {
        const v = stack.pop();
        stack.push(-v);
      };
      s.push(half, double, negate);
      fanout(s);
      expect(s.toArray()).toEqual([3, 12, -6]);
    });
  });
});
