import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import { mean } from "../src/statistics.mjs";

describe("statistics", () => {
  it("mean of single value is itself", () => {
    const s = new Stack();
    s.push(10);
    mean(s);
    expect(s.toArray()).toEqual([10]);
  });

  it("mean of two values", () => {
    const s = new Stack();
    s.push(4, 6);
    mean(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("mean of several values", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4, 5);
    mean(s);
    expect(s.toArray()).toEqual([3]);
  });

  it("mean handles decimals", () => {
    const s = new Stack();
    s.push(1, 2);
    mean(s);
    expect(s.toArray()).toEqual([1.5]);
  });

  it("mean of negative numbers", () => {
    const s = new Stack();
    s.push(-10, 10);
    mean(s);
    expect(s.toArray()).toEqual([0]);
  });
});
