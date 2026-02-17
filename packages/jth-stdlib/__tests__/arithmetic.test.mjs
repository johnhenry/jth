import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  plus,
  minus,
  times,
  divide,
  exp,
  mod,
  modulus,
  inc,
  dec,
  sum,
  product,
  abs,
  sqrt,
  floor,
  ceil,
  round,
  trunc,
  log,
  min,
  max,
  mul,
  div,
  pow,
} from "../src/arithmetic.mjs";

describe("arithmetic", () => {
  it("plus adds two numbers", () => {
    const s = new Stack();
    s.push(3, 4);
    plus(s);
    expect(s.toArray()).toEqual([7]);
  });

  it("plus concatenates strings", () => {
    const s = new Stack();
    s.push("hello", " world");
    plus(s);
    expect(s.toArray()).toEqual(["hello world"]);
  });

  it("minus subtracts second from first", () => {
    const s = new Stack();
    s.push(10, 3);
    minus(s);
    expect(s.toArray()).toEqual([7]);
  });

  it("times multiplies two numbers", () => {
    const s = new Stack();
    s.push(6, 7);
    times(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("divide divides first by second", () => {
    const s = new Stack();
    s.push(20, 4);
    divide(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("divide by zero returns Infinity", () => {
    const s = new Stack();
    s.push(1, 0);
    divide(s);
    expect(s.toArray()).toEqual([Infinity]);
  });

  it("exp raises to a power", () => {
    const s = new Stack();
    s.push(2, 10);
    exp(s);
    expect(s.toArray()).toEqual([1024]);
  });

  it("mod computes mathematical modulo (always non-negative for positive divisor)", () => {
    const s = new Stack();
    s.push(-7, 3);
    mod(s);
    expect(s.toArray()).toEqual([2]);
  });

  it("mod with positive numbers works normally", () => {
    const s = new Stack();
    s.push(7, 3);
    mod(s);
    expect(s.toArray()).toEqual([1]);
  });

  it("modulus computes JS remainder (can be negative)", () => {
    const s = new Stack();
    s.push(-7, 3);
    modulus(s);
    expect(s.toArray()).toEqual([-1]);
  });

  it("inc increments by 1", () => {
    const s = new Stack();
    s.push(5);
    inc(s);
    expect(s.toArray()).toEqual([6]);
  });

  it("dec decrements by 1", () => {
    const s = new Stack();
    s.push(5);
    dec(s);
    expect(s.toArray()).toEqual([4]);
  });

  it("sum adds all stack items", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4);
    sum(s);
    expect(s.toArray()).toEqual([10]);
  });

  it("product multiplies all stack items", () => {
    const s = new Stack();
    s.push(2, 3, 4);
    product(s);
    expect(s.toArray()).toEqual([24]);
  });

  it("abs returns absolute value", () => {
    const s = new Stack();
    s.push(-42);
    abs(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("abs of positive number is unchanged", () => {
    const s = new Stack();
    s.push(42);
    abs(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("sqrt returns square root", () => {
    const s = new Stack();
    s.push(25);
    sqrt(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("floor rounds down", () => {
    const s = new Stack();
    s.push(3.7);
    floor(s);
    expect(s.toArray()).toEqual([3]);
  });

  it("ceil rounds up", () => {
    const s = new Stack();
    s.push(3.2);
    ceil(s);
    expect(s.toArray()).toEqual([4]);
  });

  it("round rounds to nearest integer", () => {
    const s = new Stack();
    s.push(3.5);
    round(s);
    expect(s.toArray()).toEqual([4]);
  });

  it("trunc removes decimal part", () => {
    const s = new Stack();
    s.push(-3.7);
    trunc(s);
    expect(s.toArray()).toEqual([-3]);
  });

  it("log returns natural logarithm", () => {
    const s = new Stack();
    s.push(Math.E);
    log(s);
    expect(s.toArray()[0]).toBeCloseTo(1);
  });

  it("min returns smallest of all stack items", () => {
    const s = new Stack();
    s.push(5, 1, 3, 2, 4);
    min(s);
    expect(s.toArray()).toEqual([1]);
  });

  it("max returns largest of all stack items", () => {
    const s = new Stack();
    s.push(5, 1, 3, 2, 4);
    max(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("chaining: push 2 3 then plus then inc", () => {
    const s = new Stack();
    s.push(2, 3);
    plus(s);
    inc(s);
    expect(s.toArray()).toEqual([6]);
  });
});

describe("word-form arithmetic aliases", () => {
  it("plus adds two numbers", () => {
    const s = new Stack();
    s.push(3, 4);
    plus(s);
    expect(s.toArray()).toEqual([7]);
  });

  it("minus subtracts two numbers", () => {
    const s = new Stack();
    s.push(10, 3);
    minus(s);
    expect(s.toArray()).toEqual([7]);
  });

  it("mul multiplies two numbers", () => {
    const s = new Stack();
    s.push(6, 7);
    mul(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("mul is the same operation as times", () => {
    const s1 = new Stack();
    s1.push(5, 8);
    mul(s1);

    const s2 = new Stack();
    s2.push(5, 8);
    times(s2);

    expect(s1.toArray()).toEqual(s2.toArray());
  });

  it("div divides two numbers", () => {
    const s = new Stack();
    s.push(20, 4);
    div(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("div is the same operation as divide", () => {
    const s1 = new Stack();
    s1.push(15, 3);
    div(s1);

    const s2 = new Stack();
    s2.push(15, 3);
    divide(s2);

    expect(s1.toArray()).toEqual(s2.toArray());
  });

  it("mod computes modulo", () => {
    const s = new Stack();
    s.push(7, 3);
    mod(s);
    expect(s.toArray()).toEqual([1]);
  });

  it("pow raises to a power", () => {
    const s = new Stack();
    s.push(2, 10);
    pow(s);
    expect(s.toArray()).toEqual([1024]);
  });

  it("pow is the same operation as exp", () => {
    const s1 = new Stack();
    s1.push(3, 4);
    pow(s1);

    const s2 = new Stack();
    s2.push(3, 4);
    exp(s2);

    expect(s1.toArray()).toEqual(s2.toArray());
  });
});
