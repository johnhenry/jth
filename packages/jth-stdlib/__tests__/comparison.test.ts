import { describe, it, expect } from "vitest";
import { Stack } from "@johnhenry/jth-runtime";
import { JthRuntimeError } from "@johnhenry/jth-types";
import {
  equal,
  coercedEqual,
  notEqual,
  lt,
  lte,
  gt,
  gte,
  spaceship,
} from "../src/comparison.ts";

describe("comparison", () => {
  it("equal returns true for identical values", () => {
    const s = new Stack();
    s.push(5, 5);
    equal(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("equal returns false for different values", () => {
    const s = new Stack();
    s.push(5, 6);
    equal(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("equal uses strict equality (no type coercion)", () => {
    const s = new Stack();
    s.push(1, "1");
    equal(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("coercedEqual returns true with type coercion", () => {
    const s = new Stack();
    s.push(1, "1");
    coercedEqual(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("coercedEqual returns false for truly different values", () => {
    const s = new Stack();
    s.push(1, "2");
    coercedEqual(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("lt returns true when a < b", () => {
    const s = new Stack();
    s.push(3, 5);
    lt(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("lt returns false when a >= b", () => {
    const s = new Stack();
    s.push(5, 3);
    lt(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("lte returns true when a <= b", () => {
    const s = new Stack();
    s.push(5, 5);
    lte(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("lte returns false when a > b", () => {
    const s = new Stack();
    s.push(6, 5);
    lte(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("gt returns true when a > b", () => {
    const s = new Stack();
    s.push(5, 3);
    gt(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("gt returns false when a <= b", () => {
    const s = new Stack();
    s.push(3, 5);
    gt(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("gte returns true when a >= b", () => {
    const s = new Stack();
    s.push(5, 5);
    gte(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("gte returns false when a < b", () => {
    const s = new Stack();
    s.push(3, 5);
    gte(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("spaceship returns 0 for equal values", () => {
    const s = new Stack();
    s.push(5, 5);
    spaceship(s);
    expect(s.toArray()).toEqual([0]);
  });

  it("spaceship returns -1 when a > b", () => {
    const s = new Stack();
    s.push(10, 5);
    spaceship(s);
    expect(s.toArray()).toEqual([-1]);
  });

  it("spaceship returns 1 when a < b", () => {
    const s = new Stack();
    s.push(5, 10);
    spaceship(s);
    expect(s.toArray()).toEqual([1]);
  });
});

describe("predicate-style comparisons", () => {
  it("notEqual returns true for different values", () => {
    const s = new Stack();
    s.push(3, 4);
    notEqual(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("notEqual returns false for identical values", () => {
    const s = new Stack();
    s.push(5, 5);
    notEqual(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("notEqual uses strict inequality (no type coercion)", () => {
    const s = new Stack();
    s.push(1, "1");
    notEqual(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("eq? behaves like equal (alias test)", () => {
    const s = new Stack();
    s.push(3, 3);
    equal(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ne? behaves like notEqual (alias test)", () => {
    const s = new Stack();
    s.push(3, 4);
    notEqual(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("lt? behaves like lt (alias test)", () => {
    const s = new Stack();
    s.push(2, 5);
    lt(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("le? behaves like lte (alias test)", () => {
    const s = new Stack();
    s.push(5, 5);
    lte(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("gt? behaves like gt (alias test)", () => {
    const s = new Stack();
    s.push(5, 3);
    gt(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ge? behaves like gte (alias test)", () => {
    const s = new Stack();
    s.push(5, 5);
    gte(s);
    expect(s.toArray()).toEqual([true]);
  });
});

// ── Underflow: comparisons must not silently "succeed" on a short stack ──
// `equal` etc. previously computed directly on whatever op(2) popped, so on
// an empty stack `undefined === undefined` evaluated to `true` — a false
// positive with no error. Stack.popN now throws on underflow (see
// jth-runtime/__tests__/stack.test.ts), so op(2) throws before the
// comparison ever runs on undefined operands.
describe("comparisons throw on stack underflow instead of silently comparing undefined", () => {
  const ops: Array<[string, (s: Stack) => void]> = [
    ["equal", equal],
    ["coercedEqual", coercedEqual],
    ["notEqual", notEqual],
    ["lt", lt],
    ["lte", lte],
    ["gt", gt],
    ["gte", gte],
    ["spaceship", spaceship],
  ];

  for (const [name, fn] of ops) {
    it(`${name} throws JthRuntimeError on an empty stack (not undefined === undefined)`, () => {
      const s = new Stack();
      expect(() => fn(s)).toThrow(JthRuntimeError);
    });

    it(`${name} throws JthRuntimeError with only one item on the stack`, () => {
      const s = new Stack();
      s.push(1);
      expect(() => fn(s)).toThrow(JthRuntimeError);
    });
  }
});
