import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  equal,
  coercedEqual,
  lt,
  lte,
  gt,
  gte,
  spaceship,
} from "../src/comparison.mjs";

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
