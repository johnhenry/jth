import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import { and, or, xor, nand, nor, not } from "../src/logic.mjs";

describe("logic", () => {
  it("and returns truthy when both truthy", () => {
    const s = new Stack();
    s.push(1, 2);
    and(s);
    expect(s.toArray()).toEqual([2]);
  });

  it("and returns falsy when first is falsy", () => {
    const s = new Stack();
    s.push(0, 2);
    and(s);
    expect(s.toArray()).toEqual([0]);
  });

  it("and returns falsy when second is falsy", () => {
    const s = new Stack();
    s.push(1, 0);
    and(s);
    expect(s.toArray()).toEqual([0]);
  });

  it("or returns truthy when either is truthy", () => {
    const s = new Stack();
    s.push(0, 5);
    or(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("or returns falsy when both are falsy", () => {
    const s = new Stack();
    s.push(0, 0);
    or(s);
    expect(s.toArray()).toEqual([0]);
  });

  it("xor returns true when only one is truthy", () => {
    const s = new Stack();
    s.push(1, 0);
    xor(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("xor returns false when both are truthy", () => {
    const s = new Stack();
    s.push(1, 1);
    xor(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("nand returns true when at least one is falsy", () => {
    const s = new Stack();
    s.push(1, 0);
    nand(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("nand returns false when both are truthy", () => {
    const s = new Stack();
    s.push(1, 1);
    nand(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("nor returns true when both are falsy", () => {
    const s = new Stack();
    s.push(0, 0);
    nor(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("nor returns false when either is truthy", () => {
    const s = new Stack();
    s.push(0, 1);
    nor(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("not negates truthy to false", () => {
    const s = new Stack();
    s.push(1);
    not(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("not negates falsy to true", () => {
    const s = new Stack();
    s.push(0);
    not(s);
    expect(s.toArray()).toEqual([true]);
  });
});
