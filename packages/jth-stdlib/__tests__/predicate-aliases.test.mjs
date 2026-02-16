import { describe, it, expect } from "vitest";
import { registry, Stack } from "jth-runtime";
import { registerAll } from "../src/register.mjs";

// Ensure all operators are registered
registerAll();

describe("predicate-style comparison aliases in registry", () => {
  it("eq? is registered and works like =", () => {
    const fn = registry.get("eq?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(3, 3);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ne? is registered and tests inequality", () => {
    const fn = registry.get("ne?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(3, 4);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ne? returns false for equal values", () => {
    const fn = registry.get("ne?");
    const s = new Stack();
    s.push(5, 5);
    fn(s);
    expect(s.toArray()).toEqual([false]);
  });

  it("lt? is registered and works like <", () => {
    const fn = registry.get("lt?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(2, 5);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("le? is registered and works like <=", () => {
    const fn = registry.get("le?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(5, 5);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("gt? is registered and works like >", () => {
    const fn = registry.get("gt?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(5, 3);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ge? is registered and works like >=", () => {
    const fn = registry.get("ge?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push(5, 5);
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });
});

describe("string operation aliases in registry", () => {
  it("starts? is registered and works like startsWith", () => {
    const fn = registry.get("starts?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push("hello world", "hello");
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("ends? is registered and works like endsWith", () => {
    const fn = registry.get("ends?");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push("hello world", "world");
    fn(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("index-of is registered and works like indexOf", () => {
    const fn = registry.get("index-of");
    expect(fn).toBeDefined();
    const s = new Stack();
    s.push("hello world", "world");
    fn(s);
    expect(s.toArray()).toEqual([6]);
  });

  it("startsWith is still registered", () => {
    expect(registry.get("startsWith")).toBeDefined();
  });

  it("endsWith is still registered", () => {
    expect(registry.get("endsWith")).toBeDefined();
  });

  it("indexOf is still registered", () => {
    expect(registry.get("indexOf")).toBeDefined();
  });
});
