import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  push,
  pop,
  shift,
  unshift,
  suppose,
  array,
  flatten,
  sort,
  map,
  filter,
  reduce,
  mapOp,
  filterOp,
  reduceOp,
  foldOp,
  bendOp,
} from "../src/array-ops.mjs";

describe("array-ops", () => {
  describe("push", () => {
    it("pushes item onto array", () => {
      const s = new Stack();
      s.push([1, 2], 3);
      push(s);
      expect(s.toArray()).toEqual([[1, 2, 3]]);
    });

    it("returns both values if first is not an array", () => {
      const s = new Stack();
      s.push(1, 2);
      push(s);
      expect(s.toArray()).toEqual([1, 2]);
    });
  });

  describe("pop", () => {
    it("pops item from array", () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      pop(s);
      expect(s.toArray()).toEqual([[1, 2], 3]);
    });

    it("returns value as-is if not an array", () => {
      const s = new Stack();
      s.push(42);
      pop(s);
      expect(s.toArray()).toEqual([42]);
    });
  });

  describe("shift", () => {
    it("shifts item from array", () => {
      const s = new Stack();
      s.push([1, 2, 3]);
      shift(s);
      expect(s.toArray()).toEqual([[2, 3], 1]);
    });
  });

  describe("unshift", () => {
    it("unshifts item onto array", () => {
      const s = new Stack();
      s.push([2, 3], 1);
      unshift(s);
      expect(s.toArray()).toEqual([[1, 2, 3]]);
    });
  });

  describe("suppose (bug fix)", () => {
    it("adds to Array", () => {
      const s = new Stack();
      s.push([1, 2], 3);
      suppose(s);
      expect(s.toArray()).toEqual([[1, 2, 3]]);
    });

    it("adds to Set", () => {
      const s = new Stack();
      const mySet = new Set([1, 2]);
      s.push(mySet, 3);
      suppose(s);
      const result = s.toArray();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Set);
      expect([...result[0]]).toEqual([1, 2, 3]);
    });

    it("adds to Map (bug fix: old code had stack.pop without ())", () => {
      const s = new Stack();
      const myMap = new Map([["a", 1]]);
      s.push(myMap, "b");
      suppose(s);
      const result = s.toArray();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Map);
      expect(result[0].has("b")).toBe(true);
    });

    it("returns both values for unsupported types", () => {
      const s = new Stack();
      s.push(42, 3);
      suppose(s);
      expect(s.toArray()).toEqual([42, 3]);
    });
  });

  describe("array", () => {
    it("collects all items into array when n is Infinity", () => {
      const s = new Stack();
      s.push(1, 2, 3);
      array()(s);
      expect(s.toArray()).toEqual([[1, 2, 3]]);
    });

    it("collects N items into array", () => {
      const s = new Stack();
      s.push(1, 2, 3, 4);
      array(2)(s);
      expect(s.toArray()).toEqual([1, 2, [3, 4]]);
    });
  });

  describe("flatten", () => {
    it("flattens nested arrays", () => {
      const s = new Stack();
      s.push([1, 2], 3, [4, [5]]);
      flatten(s);
      expect(s.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("leaves non-arrays as-is", () => {
      const s = new Stack();
      s.push(1, 2, 3);
      flatten(s);
      expect(s.toArray()).toEqual([1, 2, 3]);
    });
  });

  describe("sort", () => {
    it("sorts ascending by default", () => {
      const s = new Stack();
      s.push(3, 1, 2);
      sort()(s);
      expect(s.toArray()).toEqual([1, 2, 3]);
    });

    it("sorts descending when ascending=false", () => {
      const s = new Stack();
      s.push(3, 1, 2);
      sort(false)(s);
      expect(s.toArray()).toEqual([3, 2, 1]);
    });
  });

  describe("legacy map (JS function)", () => {
    it("applies function to each item", () => {
      const s = new Stack();
      s.push(1, 2, 3);
      map((x) => x * 2)(s);
      expect(s.toArray()).toEqual([2, 4, 6]);
    });
  });

  describe("legacy filter (JS function)", () => {
    it("keeps items matching predicate", () => {
      const s = new Stack();
      s.push(1, 2, 3, 4, 5);
      filter((x) => x % 2 === 0)(s);
      expect(s.toArray()).toEqual([2, 4]);
    });
  });

  describe("legacy reduce (JS function)", () => {
    it("reduces stack to single value", () => {
      const s = new Stack();
      s.push(1, 2, 3, 4);
      reduce((acc, x) => acc + x, 0)(s);
      expect(s.toArray()).toEqual([10]);
    });
  });

  describe("mapOp (block-aware)", () => {
    it("applies block to each element of array", () => {
      const s = new Stack();
      s.push([1, 2, 3, 4, 5]);
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v * 2);
      };
      s.push(block);
      mapOp(s);
      expect(s.toArray()).toEqual([[2, 4, 6, 8, 10]]);
    });

    it("works with string transformation", () => {
      const s = new Stack();
      s.push(["a", "b", "c"]);
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v.toUpperCase());
      };
      s.push(block);
      mapOp(s);
      expect(s.toArray()).toEqual([["A", "B", "C"]]);
    });

    it("preserves rest of stack", () => {
      const s = new Stack();
      s.push(42, [1, 2]);
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v + 10);
      };
      s.push(block);
      mapOp(s);
      expect(s.toArray()).toEqual([42, [11, 12]]);
    });
  });

  describe("filterOp (block-aware)", () => {
    it("keeps elements where block returns truthy", () => {
      const s = new Stack();
      s.push([1, 2, 3, 4, 5]);
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v % 2 === 0);
      };
      s.push(block);
      filterOp(s);
      expect(s.toArray()).toEqual([[2, 4]]);
    });

    it("returns empty array when nothing matches", () => {
      const s = new Stack();
      s.push([1, 3, 5]);
      const block = (stack) => {
        const v = stack.pop();
        stack.push(v % 2 === 0);
      };
      s.push(block);
      filterOp(s);
      expect(s.toArray()).toEqual([[]]);
    });
  });

  describe("reduceOp (block-aware)", () => {
    it("accumulates over array with block", () => {
      const s = new Stack();
      s.push([1, 2, 3, 4, 5], 0);
      const block = (stack) => {
        const elem = stack.pop();
        const acc = stack.pop();
        stack.push(acc + elem);
      };
      s.push(block);
      reduceOp(s);
      expect(s.toArray()).toEqual([15]);
    });

    it("works with string accumulation", () => {
      const s = new Stack();
      s.push(["a", "b", "c"], "");
      const block = (stack) => {
        const elem = stack.pop();
        const acc = stack.pop();
        stack.push(acc + elem);
      };
      s.push(block);
      reduceOp(s);
      expect(s.toArray()).toEqual(["abc"]);
    });
  });

  describe("foldOp (alias for reduceOp)", () => {
    it("is the same function as reduceOp", () => {
      expect(foldOp).toBe(reduceOp);
    });

    it("accumulates correctly", () => {
      const s = new Stack();
      s.push([1, 2, 3], 0);
      const block = (stack) => {
        const elem = stack.pop();
        const acc = stack.pop();
        stack.push(acc + elem);
      };
      s.push(block);
      foldOp(s);
      expect(s.toArray()).toEqual([6]);
    });
  });

  describe("bendOp (unfold/anamorphism)", () => {
    it("generates array from seed", () => {
      const s = new Stack();
      s.push(1); // seed
      const predicate = (stack) => {
        const v = stack.pop();
        stack.push(v <= 5);
      };
      const step = (stack) => {
        const v = stack.pop();
        stack.push(v, v + 1); // [value, nextSeed]
      };
      s.push(predicate, step);
      bendOp(s);
      expect(s.toArray()).toEqual([[1, 2, 3, 4, 5]]);
    });

    it("generates empty array when predicate is immediately false", () => {
      const s = new Stack();
      s.push(10); // seed
      const predicate = (stack) => {
        const v = stack.pop();
        stack.push(v < 5);
      };
      const step = (stack) => {
        const v = stack.pop();
        stack.push(v, v + 1);
      };
      s.push(predicate, step);
      bendOp(s);
      expect(s.toArray()).toEqual([[]]);
    });

    it("generates powers of 2", () => {
      const s = new Stack();
      s.push(1); // seed
      const predicate = (stack) => {
        const v = stack.pop();
        stack.push(v <= 16);
      };
      const step = (stack) => {
        const v = stack.pop();
        stack.push(v, v * 2); // [value, nextSeed]
      };
      s.push(predicate, step);
      bendOp(s);
      expect(s.toArray()).toEqual([[1, 2, 4, 8, 16]]);
    });
  });
});
