import { describe, it, expect } from "vitest";
import { op, variadic } from "../src/op.mjs";
import { Stack } from "../src/stack.mjs";

describe("op(arity)", () => {
  it("op(2) creates a binary operator", () => {
    const add = op(2)((a, b) => [a + b]);
    const s = new Stack();
    s.push(3, 4);
    add(s);
    expect(s.toArray()).toEqual([7]);
  });

  it("op(1) creates a unary operator", () => {
    const inc = op(1)((a) => [a + 1]);
    const s = new Stack();
    s.push(10);
    inc(s);
    expect(s.toArray()).toEqual([11]);
  });

  it("op(0) creates a producer (pushes without popping)", () => {
    const pushFive = op(0)(() => [5]);
    const s = new Stack();
    s.push(1);
    pushFive(s);
    expect(s.toArray()).toEqual([1, 5]);
  });

  it("op(2) returning multiple values pushes all of them", () => {
    const divmod = op(2)((a, b) => [Math.floor(a / b), a % b]);
    const s = new Stack();
    s.push(10, 3);
    divmod(s);
    expect(s.toArray()).toEqual([3, 1]);
  });

  it("op(2) returning undefined pushes nothing", () => {
    const sideEffect = op(2)((a, b) => {
      // side-effect only, no return
    });
    const s = new Stack();
    s.push(1, 2, 3, 4);
    sideEffect(s);
    expect(s.toArray()).toEqual([1, 2]);
  });

  it("op stores _arity metadata", () => {
    const fn = op(3)((a, b, c) => [a + b + c]);
    expect(fn._arity).toBe(3);
  });

  it("op stores _name from named function", () => {
    const fn = op(1)(function double(x) {
      return [x * 2];
    });
    expect(fn._name).toBe("double");
  });

  it("op stores undefined _name for anonymous function", () => {
    const fn = op(1)((x) => [x]);
    expect(fn._name).toBeUndefined();
  });

  it("op on stack with fewer items than arity pops what is available", () => {
    const add = op(2)((a, b) => [a + b]);
    const s = new Stack();
    s.push(5);
    add(s);
    // popN(2) on a stack with 1 item returns [5], fn gets (5, undefined)
    expect(s.toArray()).toEqual([NaN]);
  });

  it("op(2) pops in correct order (bottom, top)", () => {
    const sub = op(2)((a, b) => [a - b]);
    const s = new Stack();
    s.push(10, 3);
    sub(s);
    // popN returns [10, 3], so a=10, b=3
    expect(s.toArray()).toEqual([7]);
  });

  it("op returning empty array pushes nothing", () => {
    const consume = op(1)(() => []);
    const s = new Stack();
    s.push(1, 2);
    consume(s);
    expect(s.toArray()).toEqual([1]);
  });
});

describe("variadic(fn)", () => {
  it("consumes all stack items", () => {
    const sum = variadic((...args) => [args.reduce((a, b) => a + b, 0)]);
    const s = new Stack();
    s.push(1, 2, 3, 4);
    sum(s);
    expect(s.toArray()).toEqual([10]);
  });

  it("works on empty stack", () => {
    const sum = variadic((...args) => [args.reduce((a, b) => a + b, 0)]);
    const s = new Stack();
    sum(s);
    expect(s.toArray()).toEqual([0]);
  });

  it("stores _arity as Infinity", () => {
    const fn = variadic((...args) => [args.length]);
    expect(fn._arity).toBe(Infinity);
  });

  it("stores _name from named function", () => {
    const fn = variadic(function count(...args) {
      return [args.length];
    });
    expect(fn._name).toBe("count");
  });

  it("returning undefined pushes nothing back", () => {
    const drain = variadic((...args) => {
      // discard everything
    });
    const s = new Stack();
    s.push(1, 2, 3);
    drain(s);
    expect(s.toArray()).toEqual([]);
  });
});
