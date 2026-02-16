import { describe, it, expect } from "vitest";
import { annotate, getMeta, delay, persist, rewind, skip, limit } from "../src/meta.mjs";

describe("annotate / getMeta", () => {
  it("getMeta returns empty object for unannotated function", () => {
    const fn = () => {};
    expect(getMeta(fn)).toEqual({});
  });

  it("annotate creates a wrapper with metadata", () => {
    const fn = (x) => x + 1;
    const wrapped = annotate(fn, { delay: 3 });
    expect(getMeta(wrapped)).toEqual({ delay: 3 });
  });

  it("annotated wrapper calls the original function", () => {
    const fn = (x) => x * 2;
    const wrapped = annotate(fn, { delay: 1 });
    expect(wrapped(5)).toBe(10);
  });

  it("annotate does not modify the original function", () => {
    const fn = () => {};
    annotate(fn, { delay: 5 });
    expect(getMeta(fn)).toEqual({});
  });

  it("annotate merges metadata from previous annotations", () => {
    const fn = () => {};
    const first = annotate(fn, { delay: 2 });
    const second = annotate(first, { persist: 3 });
    expect(getMeta(second)).toEqual({ delay: 2, persist: 3 });
  });

  it("annotate overwrites conflicting keys from previous annotations", () => {
    const fn = () => {};
    const first = annotate(fn, { delay: 2, persist: 1 });
    const second = annotate(first, { delay: 5 });
    expect(getMeta(second)).toEqual({ delay: 5, persist: 1 });
  });

  it("uses WeakMap, does not pollute function properties", () => {
    const fn = () => {};
    const wrapped = annotate(fn, { delay: 1 });
    expect(wrapped.delay).toBeUndefined();
    expect("delay" in wrapped).toBe(false);
  });
});

describe("convenience wrappers", () => {
  it("delay(n) sets delay meta", () => {
    const fn = () => {};
    const wrapped = delay(2)(fn);
    expect(getMeta(wrapped)).toEqual({ delay: 2 });
  });

  it("persist(n) sets persist meta", () => {
    const fn = () => {};
    const wrapped = persist(3)(fn);
    expect(getMeta(wrapped)).toEqual({ persist: 3 });
  });

  it("rewind(n) sets rewind meta", () => {
    const fn = () => {};
    const wrapped = rewind(1)(fn);
    expect(getMeta(wrapped)).toEqual({ rewind: 1 });
  });

  it("skip(n) sets skip meta", () => {
    const fn = () => {};
    const wrapped = skip(4)(fn);
    expect(getMeta(wrapped)).toEqual({ skip: 4 });
  });

  it("limit(n) sets limit meta", () => {
    const fn = () => {};
    const wrapped = limit(2)(fn);
    expect(getMeta(wrapped)).toEqual({ limit: 2 });
  });
});
