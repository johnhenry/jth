import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import { JthRuntimeError } from "jth-types";
import { mapOp, filterOp, reduceOp, bendOp } from "../src/array-ops.ts";
import { MAX_ITERATIONS } from "../src/control-flow.ts";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("array-ops with async blocks", () => {
  describe("mapOp", () => {
    it("awaits async blocks and produces the correct array", async () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      s.push(async (stack: Stack) => {
        const v = stack.pop() as number;
        await tick();
        stack.push(v * v);
      });
      const r = mapOp(s);
      expect(r).toBeInstanceOf(Promise);
      await r;
      expect(s.toArray()).toEqual([[1, 4, 9]]);
    });

    it("handles async promotion mid-array (sync then async blocks)", async () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      s.push(async (stack: Stack) => {
        const v = stack.pop() as number;
        if (v > 1) await tick();
        stack.push(v * 10);
      });
      await mapOp(s);
      expect(s.toArray()).toEqual([[10, 20, 30]]);
    });

    it("stays synchronous for sync blocks (no forced Promise)", () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      s.push((stack: Stack) => {
        const v = stack.pop() as number;
        stack.push(v * 2);
      });
      const r = mapOp(s);
      expect(r).not.toBeInstanceOf(Promise);
      expect(s.toArray()).toEqual([[2, 4, 6]]);
    });
  });

  describe("filterOp", () => {
    it("awaits async predicate blocks", async () => {
      const s = new Stack();
      s.push([1, 2, 3, 4, 5]);
      s.push(async (stack: Stack) => {
        const v = stack.pop() as number;
        await tick();
        stack.push(v % 2 === 0);
      });
      const r = filterOp(s);
      expect(r).toBeInstanceOf(Promise);
      await r;
      expect(s.toArray()).toEqual([[2, 4]]);
    });

    it("stays synchronous for sync predicates", () => {
      const s = new Stack();
      s.push([1, 2, 3, 4]);
      s.push((stack: Stack) => {
        const v = stack.pop() as number;
        stack.push(v > 2);
      });
      const r = filterOp(s);
      expect(r).not.toBeInstanceOf(Promise);
      expect(s.toArray()).toEqual([[3, 4]]);
    });
  });

  describe("reduceOp", () => {
    it("awaits async reducer blocks", async () => {
      const s = new Stack();
      s.push([1, 2, 3, 4], 0);
      s.push(async (stack: Stack) => {
        const elem = stack.pop() as number;
        const acc = stack.pop() as number;
        await tick();
        stack.push(acc + elem);
      });
      const r = reduceOp(s);
      expect(r).toBeInstanceOf(Promise);
      await r;
      expect(s.toArray()).toEqual([10]);
    });

    it("stays synchronous for sync reducers", () => {
      const s = new Stack();
      s.push([1, 2, 3], 0);
      s.push((stack: Stack) => {
        const elem = stack.pop() as number;
        const acc = stack.pop() as number;
        stack.push(acc + elem);
      });
      const r = reduceOp(s);
      expect(r).not.toBeInstanceOf(Promise);
      expect(s.toArray()).toEqual([6]);
    });
  });

  describe("bendOp", () => {
    it("awaits async predicate and step blocks", async () => {
      const s = new Stack();
      s.push(1);
      s.push(async (stack: Stack) => {
        const v = stack.pop() as number;
        await tick();
        stack.push(v <= 4);
      });
      s.push(async (stack: Stack) => {
        const v = stack.pop() as number;
        await tick();
        stack.push(v, v + 1);
      });
      const r = bendOp(s);
      expect(r).toBeInstanceOf(Promise);
      await r;
      expect(s.toArray()).toEqual([[1, 2, 3, 4]]);
    });

    it("stays synchronous for sync blocks", () => {
      const s = new Stack();
      s.push(1);
      s.push((stack: Stack) => {
        const v = stack.pop() as number;
        stack.push(v <= 3);
      });
      s.push((stack: Stack) => {
        const v = stack.pop() as number;
        stack.push(v, v + 1);
      });
      const r = bendOp(s);
      expect(r).not.toBeInstanceOf(Promise);
      expect(s.toArray()).toEqual([[1, 2, 3]]);
    });

    // 1M capped iterations take a few seconds under load; allow extra time.
    it("throws ITERATION_LIMIT instead of hanging on a non-terminating bend", { timeout: 30000 }, () => {
      const s = new Stack();
      s.push(1);
      s.push((stack: Stack) => {
        stack.pop();
        stack.push(true); // predicate never terminates
      });
      s.push((stack: Stack) => {
        const v = stack.pop() as number;
        stack.push(v, v); // seed never changes
      });
      let caught: unknown;
      try {
        bendOp(s);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(JthRuntimeError);
      expect((caught as JthRuntimeError).code).toBe("ITERATION_LIMIT");
      expect((caught as JthRuntimeError).message).toContain(String(MAX_ITERATIONS));
    });
  });
});
