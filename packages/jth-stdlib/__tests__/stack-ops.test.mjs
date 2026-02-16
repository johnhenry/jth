import { describe, it, expect, vi } from "vitest";
import { Stack } from "jth-runtime";
import {
  noop,
  clear,
  spread,
  drop,
  keepN,
  keepHalf,
  dropHalf,
  copy,
  dupe,
  retrieve,
  dig,
  bury,
  cycle,
  recycle,
  swap,
  hold,
  seed,
  reverse,
  count,
  collect,
  peek,
  view,
} from "../src/stack-ops.mjs";

describe("stack-ops", () => {
  it("noop does nothing to the stack", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    noop(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("clear removes all items", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    clear(s);
    expect(s.toArray()).toEqual([]);
  });

  it("spread pops an array and pushes its elements", () => {
    const s = new Stack();
    s.push([1, 2, 3]);
    spread(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("spread passes non-array values through", () => {
    const s = new Stack();
    s.push(42);
    spread(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("drop removes the top item", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    drop(s);
    expect(s.toArray()).toEqual([1, 2]);
  });

  it("keepN keeps only the bottom n items", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4, 5);
    keepN(3)(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("keepHalf keeps the first half (ceiling for odd)", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4, 5);
    keepHalf(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("keepHalf on even-length stack keeps first half", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4);
    keepHalf(s);
    expect(s.toArray()).toEqual([1, 2]);
  });

  it("dropHalf drops second half (floor for odd)", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4, 5);
    dropHalf(s);
    expect(s.toArray()).toEqual([1, 2]);
  });

  it("copy duplicates the entire stack", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    copy(s);
    expect(s.toArray()).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it("dupe duplicates the top item", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    dupe(s);
    expect(s.toArray()).toEqual([1, 2, 3, 3]);
  });

  it("retrieve(0) gets the top item only", () => {
    const s = new Stack();
    s.push(10, 20, 30);
    retrieve(0)(s);
    expect(s.toArray()).toEqual([30]);
  });

  it("retrieve(1) gets the second from top", () => {
    const s = new Stack();
    s.push(10, 20, 30);
    retrieve(1)(s);
    expect(s.toArray()).toEqual([20]);
  });

  it("dig(1) pulls the second item to the top", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    dig(1)(s);
    expect(s.toArray()).toEqual([1, 3, 2]);
  });

  it("dig on single-element stack does nothing", () => {
    const s = new Stack();
    s.push(1);
    dig(1)(s);
    expect(s.toArray()).toEqual([1]);
  });

  it("bury(1) moves the top item one position down", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    bury(1)(s);
    expect(s.toArray()).toEqual([1, 3, 2]);
  });

  it("cycle moves top to bottom", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    cycle(1)(s);
    expect(s.toArray()).toEqual([3, 1, 2]);
  });

  it("recycle moves bottom to top", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    recycle(1)(s);
    expect(s.toArray()).toEqual([2, 3, 1]);
  });

  it("swap swaps the top two items", () => {
    const s = new Stack();
    s.push(1, 2);
    swap(s);
    expect(s.toArray()).toEqual([2, 1]);
  });

  it("hold pushes a function as a value", () => {
    const s = new Stack();
    const fn = () => 42;
    hold(fn)(s);
    expect(s.toArray()).toEqual([fn]);
  });

  it("seed pushes values only when stack is empty", () => {
    const s = new Stack();
    seed(1, 2, 3)(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("seed does nothing when stack is non-empty", () => {
    const s = new Stack();
    s.push(99);
    seed(1, 2, 3)(s);
    expect(s.toArray()).toEqual([99]);
  });

  it("reverse reverses the entire stack", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    reverse(s);
    expect(s.toArray()).toEqual([3, 2, 1]);
  });

  it("count pushes stack length without consuming", () => {
    const s = new Stack();
    s.push(10, 20, 30);
    count(s);
    expect(s.toArray()).toEqual([10, 20, 30, 3]);
  });

  it("collect gathers all items into one array", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    collect(s);
    expect(s.toArray()).toEqual([[1, 2, 3]]);
  });

  it("peek logs the top item without consuming", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const s = new Stack();
    s.push(1, 2, 3);
    peek(s);
    expect(spy).toHaveBeenCalledWith(3);
    expect(s.toArray()).toEqual([1, 2, 3]);
    spy.mockRestore();
  });

  it("view logs entire stack without consuming", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const s = new Stack();
    s.push(1, 2, 3);
    view(s);
    expect(spy).toHaveBeenCalledWith(1, 2, 3);
    expect(s.toArray()).toEqual([1, 2, 3]);
    spy.mockRestore();
  });
});
