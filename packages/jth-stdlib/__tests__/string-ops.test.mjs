import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  len,
  split,
  replace,
  startsWith,
  endsWith,
  upper,
  lower,
  trim,
  slice,
  indexOf,
  strcat,
  strseq,
  join,
  substring,
} from "../src/string-ops.mjs";

describe("string-ops", () => {
  it("len returns string length", () => {
    const s = new Stack();
    s.push("hello");
    len(s);
    expect(s.toArray()).toEqual([5]);
  });

  it("len returns array length", () => {
    const s = new Stack();
    s.push([1, 2, 3]);
    len(s);
    expect(s.toArray()).toEqual([3]);
  });

  it("split splits by delimiter", () => {
    const s = new Stack();
    s.push("a,b,c");
    split(",")(s);
    expect(s.toArray()).toEqual([["a", "b", "c"]]);
  });

  it("split defaults to space", () => {
    const s = new Stack();
    s.push("hello world");
    split()(s);
    expect(s.toArray()).toEqual([["hello", "world"]]);
  });

  it("replace replaces substring", () => {
    const s = new Stack();
    s.push("hello world");
    replace("world", "jth")(s);
    expect(s.toArray()).toEqual(["hello jth"]);
  });

  it("startsWith checks prefix", () => {
    const s = new Stack();
    s.push("hello", "hel");
    startsWith(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("endsWith checks suffix", () => {
    const s = new Stack();
    s.push("hello", "llo");
    endsWith(s);
    expect(s.toArray()).toEqual([true]);
  });

  it("upper converts to uppercase", () => {
    const s = new Stack();
    s.push("hello");
    upper(s);
    expect(s.toArray()).toEqual(["HELLO"]);
  });

  it("lower converts to lowercase", () => {
    const s = new Stack();
    s.push("HELLO");
    lower(s);
    expect(s.toArray()).toEqual(["hello"]);
  });

  it("trim removes whitespace", () => {
    const s = new Stack();
    s.push("  hello  ");
    trim(s);
    expect(s.toArray()).toEqual(["hello"]);
  });

  it("slice extracts portion", () => {
    const s = new Stack();
    s.push("hello world");
    slice(0, 5)(s);
    expect(s.toArray()).toEqual(["hello"]);
  });

  it("indexOf finds position", () => {
    const s = new Stack();
    s.push("hello world", "world");
    indexOf(s);
    expect(s.toArray()).toEqual([6]);
  });

  it("strcat concatenates in order", () => {
    const s = new Stack();
    s.push("hello", " world");
    strcat(s);
    expect(s.toArray()).toEqual(["hello world"]);
  });

  it("strseq concatenates in reverse order", () => {
    const s = new Stack();
    s.push("hello", " world");
    strseq(s);
    expect(s.toArray()).toEqual([" worldhello"]);
  });

  it("join joins array with separator", () => {
    const s = new Stack();
    s.push(["a", "b", "c"]);
    join(",")(s);
    expect(s.toArray()).toEqual(["a,b,c"]);
  });

  it("substring extracts between indices", () => {
    const s = new Stack();
    s.push("hello world");
    substring(6, 11)(s);
    expect(s.toArray()).toEqual(["world"]);
  });
});
