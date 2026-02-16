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

  describe("map", () => {
    it("applies function to each item", () => {
      const s = new Stack();
      s.push(1, 2, 3);
      map((x) => x * 2)(s);
      expect(s.toArray()).toEqual([2, 4, 6]);
    });
  });

  describe("filter", () => {
    it("keeps items matching predicate", () => {
      const s = new Stack();
      s.push(1, 2, 3, 4, 5);
      filter((x) => x % 2 === 0)(s);
      expect(s.toArray()).toEqual([2, 4]);
    });
  });

  describe("reduce", () => {
    it("reduces stack to single value", () => {
      const s = new Stack();
      s.push(1, 2, 3, 4);
      reduce((acc, x) => acc + x, 0)(s);
      expect(s.toArray()).toEqual([10]);
    });
  });
});
