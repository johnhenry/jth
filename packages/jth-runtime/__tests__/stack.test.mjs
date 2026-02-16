import { describe, it, expect } from "vitest";
import { Stack } from "../src/stack.mjs";

describe("Stack", () => {
  it("should start empty", () => {
    const s = new Stack();
    expect(s.length).toBe(0);
    expect(s.isEmpty()).toBe(true);
    expect(s.toArray()).toEqual([]);
  });

  it("push adds items", () => {
    const s = new Stack();
    s.push(1);
    expect(s.length).toBe(1);
    expect(s.toArray()).toEqual([1]);
  });

  it("push adds multiple items at once", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    expect(s.length).toBe(3);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("pop removes and returns last item", () => {
    const s = new Stack();
    s.push(10, 20, 30);
    expect(s.pop()).toBe(30);
    expect(s.length).toBe(2);
    expect(s.toArray()).toEqual([10, 20]);
  });

  it("pop on empty stack returns undefined", () => {
    const s = new Stack();
    expect(s.pop()).toBeUndefined();
  });

  it("popN removes n items in original stack order", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4, 5);
    const result = s.popN(3);
    expect(result).toEqual([3, 4, 5]);
    expect(s.toArray()).toEqual([1, 2]);
  });

  it("popN with n larger than stack length returns all items", () => {
    const s = new Stack();
    s.push(1, 2);
    const result = s.popN(5);
    expect(result).toEqual([1, 2]);
    expect(s.isEmpty()).toBe(true);
  });

  it("popN with 0 returns empty array", () => {
    const s = new Stack();
    s.push(1, 2);
    const result = s.popN(0);
    expect(result).toEqual([]);
    expect(s.length).toBe(2);
  });

  it("peek returns last item without removing it", () => {
    const s = new Stack();
    s.push(10, 20);
    expect(s.peek()).toBe(20);
    expect(s.length).toBe(2);
  });

  it("peek on empty stack returns undefined", () => {
    const s = new Stack();
    expect(s.peek()).toBeUndefined();
  });

  it("peekN returns last n items without removing them", () => {
    const s = new Stack();
    s.push(1, 2, 3, 4);
    expect(s.peekN(2)).toEqual([3, 4]);
    expect(s.length).toBe(4);
  });

  it("length reflects current count", () => {
    const s = new Stack();
    expect(s.length).toBe(0);
    s.push(1);
    expect(s.length).toBe(1);
    s.push(2, 3);
    expect(s.length).toBe(3);
    s.pop();
    expect(s.length).toBe(2);
  });

  it("toArray returns a copy", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    const arr = s.toArray();
    arr.push(99);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("clear empties the stack", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    s.clear();
    expect(s.length).toBe(0);
    expect(s.isEmpty()).toBe(true);
  });

  it("isEmpty returns true/false correctly", () => {
    const s = new Stack();
    expect(s.isEmpty()).toBe(true);
    s.push(1);
    expect(s.isEmpty()).toBe(false);
    s.pop();
    expect(s.isEmpty()).toBe(true);
  });

  it("swap exchanges the top two items", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    s.swap();
    expect(s.toArray()).toEqual([1, 3, 2]);
  });

  it("swap on stack with fewer than 2 items does nothing", () => {
    const s = new Stack();
    s.push(1);
    s.swap();
    expect(s.toArray()).toEqual([1]);

    const empty = new Stack();
    empty.swap();
    expect(empty.toArray()).toEqual([]);
  });

  it("dup duplicates the top item", () => {
    const s = new Stack();
    s.push(10, 20);
    s.dup();
    expect(s.toArray()).toEqual([10, 20, 20]);
    expect(s.length).toBe(3);
  });

  it("dup on empty stack does nothing", () => {
    const s = new Stack();
    s.dup();
    expect(s.isEmpty()).toBe(true);
  });

  it("clone creates an independent copy", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    const c = s.clone();
    expect(c.toArray()).toEqual([1, 2, 3]);
    c.push(4);
    expect(s.toArray()).toEqual([1, 2, 3]);
    expect(c.toArray()).toEqual([1, 2, 3, 4]);
  });

  it("is iterable via Symbol.iterator", () => {
    const s = new Stack();
    s.push(1, 2, 3);
    const collected = [...s];
    expect(collected).toEqual([1, 2, 3]);
  });

  it("supports for-of iteration", () => {
    const s = new Stack();
    s.push("a", "b", "c");
    const result = [];
    for (const item of s) {
      result.push(item);
    }
    expect(result).toEqual(["a", "b", "c"]);
  });
});
