import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  typeOf,
  isNumber,
  isString,
  isArray,
  isNil,
  isFunction,
  isEmpty,
  contains,
} from "../src/type-ops.mjs";

describe("type-ops", () => {
  it("typeOf returns correct type for number", () => {
    const s = new Stack();
    s.push(42);
    typeOf(s);
    expect(s.toArray()).toEqual(["number"]);
  });

  it("typeOf returns correct type for string", () => {
    const s = new Stack();
    s.push("hello");
    typeOf(s);
    expect(s.toArray()).toEqual(["string"]);
  });

  it("isNumber returns true for numbers", () => {
    const s = new Stack();
    s.push(42);
    isNumber(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isNumber returns false for strings", () => {
    const s = new Stack();
    s.push("42");
    isNumber(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("isString returns true for strings", () => {
    const s = new Stack();
    s.push("hello");
    isString(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isArray returns true for arrays", () => {
    const s = new Stack();
    s.push([1, 2, 3]);
    isArray(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isNil returns true for null", () => {
    const s = new Stack();
    s.push(null);
    isNil(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isNil returns true for undefined", () => {
    const s = new Stack();
    s.push(undefined);
    isNil(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isNil returns false for 0", () => {
    const s = new Stack();
    s.push(0);
    isNil(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("isFunction returns true for functions", () => {
    const s = new Stack();
    s.push(() => {});
    isFunction(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isEmpty returns true for empty string", () => {
    const s = new Stack();
    s.push("");
    isEmpty(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isEmpty returns true for empty array", () => {
    const s = new Stack();
    s.push([]);
    isEmpty(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isEmpty returns true for empty object", () => {
    const s = new Stack();
    s.push({});
    isEmpty(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("isEmpty returns false for non-empty string", () => {
    const s = new Stack();
    s.push("hi");
    isEmpty(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("isEmpty returns true for null", () => {
    const s = new Stack();
    s.push(null);
    isEmpty(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("contains returns true when array includes item", () => {
    const s = new Stack();
    s.push([1, 2, 3], 2);
    contains(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("contains returns false when array does not include item", () => {
    const s = new Stack();
    s.push([1, 2, 3], 5);
    contains(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("contains works with strings", () => {
    const s = new Stack();
    s.push("hello world", "world");
    contains(s);
    expect(s.toArray()).toEqual([true]);
  });
});
