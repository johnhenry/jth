import { describe, it, expect } from "vitest";
import { Stack, registry } from "jth-runtime";
import { next, drain, iter, exhaustIterator } from "../src/iterator-ops.ts";
import { run } from "jth-compiler";
import "../src/index.ts";

describe("iterator-ops: iter", () => {
  it("converts an iterable to an iterator", () => {
    const s = new Stack();
    s.push([1, 2, 3]);
    iter(s);
    const it = s.peek() as Iterator<number>;
    expect(typeof it.next).toBe("function");
    expect(it.next()).toEqual({ done: false, value: 1 });
  });

  it("works with strings", () => {
    const s = new Stack();
    s.push("ab");
    iter(s);
    const it = s.peek() as Iterator<string>;
    expect(it.next()).toEqual({ done: false, value: "a" });
  });

  it("passes non-iterables through unchanged", () => {
    const s = new Stack();
    s.push(42);
    iter(s);
    expect(s.toArray()).toEqual([42]);
  });
});

describe("iterator-ops: next", () => {
  it("pulls the next value, keeping the iterator below it", () => {
    const s = new Stack();
    s.push([10, 20][Symbol.iterator]());
    next(s);
    const arr = s.toArray();
    expect(arr).toHaveLength(2);
    expect(typeof (arr[0] as Iterator<number>).next).toBe("function");
    expect(arr[1]).toBe(10);
  });

  it("on exhaustion pushes only the iterator back", () => {
    const s = new Stack();
    const it = [][Symbol.iterator]();
    s.push(it);
    next(s);
    expect(s.toArray()).toEqual([it]);
  });

  it("passes non-iterators through unchanged", () => {
    const s = new Stack();
    s.push("plain");
    next(s);
    expect(s.toArray()).toEqual(["plain"]);
  });

  it("successive next calls walk the iterator", () => {
    const s = new Stack();
    s.push([1, 2][Symbol.iterator]());
    next(s);
    const value1 = s.pop();
    next(s);
    const value2 = s.pop();
    expect([value1, value2]).toEqual([1, 2]);
  });
});

describe("iterator-ops: drain", () => {
  it("drains n values, iterator stays on top", () => {
    const s = new Stack();
    s.push([1, 2, 3, 4][Symbol.iterator]());
    drain(3)(s);
    const arr = s.toArray();
    expect(arr.slice(0, 3)).toEqual([1, 2, 3]);
    expect(typeof (arr[3] as Iterator<number>).next).toBe("function");
  });

  it("stops early when the iterator is exhausted", () => {
    const s = new Stack();
    s.push([1][Symbol.iterator]());
    drain(5)(s);
    const arr = s.toArray();
    expect(arr).toHaveLength(2);
    expect(arr[0]).toBe(1);
  });

  it("defaults to draining one value", () => {
    const s = new Stack();
    s.push([7, 8][Symbol.iterator]());
    drain()(s);
    const arr = s.toArray();
    expect(arr[0]).toBe(7);
    expect(arr).toHaveLength(2);
  });

  it("passes non-iterators through unchanged", () => {
    const s = new Stack();
    s.push(99);
    drain(2)(s);
    expect(s.toArray()).toEqual([99]);
  });
});

describe("iterator-ops: exhaustIterator (..)", () => {
  it("collects all remaining values into an array", () => {
    const s = new Stack();
    s.push([1, 2, 3][Symbol.iterator]());
    exhaustIterator(s);
    expect(s.toArray()).toEqual([[1, 2, 3]]);
  });

  it("spreads any iterable (e.g. a string)", () => {
    const s = new Stack();
    s.push("abc");
    exhaustIterator(s);
    expect(s.toArray()).toEqual([["a", "b", "c"]]);
  });

  it("passes non-iterables through unchanged", () => {
    const s = new Stack();
    s.push(5);
    exhaustIterator(s);
    expect(s.toArray()).toEqual([5]);
  });
});

describe("iterator-ops: registered ops via jth programs", () => {
  it("iter + next pull values from an array", async () => {
    const { stack } = await run("[10 20 30] iter next;");
    const arr = stack.toArray();
    expect(arr[arr.length - 1]).toBe(10);
  });

  it('".." is registered (the lexer does not currently tokenize it, so via registry)', () => {
    // Note: `..` in jth source lexes as two `.` operators, so the ".."
    // registration is only reachable programmatically today.
    const fn = registry.get("..");
    expect(fn).toBe(exhaustIterator);
    const s = new Stack();
    s.push([4, 5][Symbol.iterator]());
    fn!(s);
    expect(s.toArray()).toEqual([[4, 5]]);
  });
});
