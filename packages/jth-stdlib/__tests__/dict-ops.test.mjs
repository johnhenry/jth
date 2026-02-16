import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  get,
  set,
  drill,
  drillSet,
  keys,
  values,
  entries,
  merge,
  hasKey,
  record,
} from "../src/dict-ops.mjs";

describe("dict-ops", () => {
  it("get retrieves value by key", () => {
    const s = new Stack();
    s.push({ a: 1, b: 2 });
    get("a")(s);
    expect(s.toArray()).toEqual([1]);
  });

  it("set sets value by key", () => {
    const s = new Stack();
    s.push({ a: 1 });
    set("b", 2)(s);
    expect(s.toArray()).toEqual([{ a: 1, b: 2 }]);
  });

  it("drill navigates nested objects", () => {
    const s = new Stack();
    s.push({ a: { b: { c: 42 } } });
    drill("a", "b", "c")(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("drill returns undefined for missing path", () => {
    const s = new Stack();
    s.push({ a: 1 });
    drill("x", "y")(s);
    expect(s.toArray()).toEqual([undefined]);
  });

  it("drillSet sets deeply nested value", () => {
    const s = new Stack();
    s.push({ a: {} });
    drillSet("a", "b", 42)(s);
    expect(s.toArray()).toEqual([{ a: { b: 42 } }]);
  });

  it("keys returns object keys", () => {
    const s = new Stack();
    s.push({ a: 1, b: 2 });
    keys(s);
    expect(s.toArray()).toEqual([["a", "b"]]);
  });

  it("values returns object values", () => {
    const s = new Stack();
    s.push({ a: 1, b: 2 });
    values(s);
    expect(s.toArray()).toEqual([[1, 2]]);
  });

  it("entries returns key-value pairs", () => {
    const s = new Stack();
    s.push({ a: 1, b: 2 });
    entries(s);
    expect(s.toArray()).toEqual([
      [
        ["a", 1],
        ["b", 2],
      ],
    ]);
  });

  it("merge combines two objects", () => {
    const s = new Stack();
    s.push({ a: 1 }, { b: 2 });
    merge(s);
    expect(s.toArray()).toEqual([{ a: 1, b: 2 }]);
  });

  it("merge gives precedence to second object", () => {
    const s = new Stack();
    s.push({ a: 1 }, { a: 2 });
    merge(s);
    expect(s.toArray()).toEqual([{ a: 2 }]);
  });

  it("hasKey checks key existence", () => {
    const s = new Stack();
    s.push({ a: 1 });
    hasKey("a")(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("hasKey returns false for missing key", () => {
    const s = new Stack();
    s.push({ a: 1 });
    hasKey("b")(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("record builds object from key-value pairs on stack", () => {
    const s = new Stack();
    // Stack order: value1, key1, value2, key2 (variadic consumes all)
    s.push(1, "a", 2, "b");
    record(s);
    expect(s.toArray()).toEqual([{ a: 1, b: 2 }]);
  });

  it("record throws on odd number of args", () => {
    const s = new Stack();
    s.push(1, "a", 2);
    expect(() => record(s)).toThrow("record requires even number of args");
  });
});
