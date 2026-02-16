import { describe, it, expect } from "vitest";
import { Stack } from "jth-runtime";
import {
  intoJson,
  toJson,
  fromJson,
  intoLines,
  toLines,
  fromLines,
} from "../src/serialization.mjs";

describe("serialization", () => {
  it("intoJson stringifies a value", () => {
    const s = new Stack();
    s.push({ a: 1 });
    intoJson(s);
    expect(s.toArray()).toEqual(['{"a":1}']);
  });

  it("toJson parses a JSON string", () => {
    const s = new Stack();
    s.push('{"a":1}');
    toJson(s);
    expect(s.toArray()).toEqual([{ a: 1 }]);
  });

  it("fromJson parses a JSON string (alias for toJson)", () => {
    const s = new Stack();
    s.push('{"b":2}');
    fromJson(s);
    expect(s.toArray()).toEqual([{ b: 2 }]);
  });

  it("fromJson parses a JSON array", () => {
    const s = new Stack();
    s.push("[1,2,3]");
    fromJson(s);
    expect(s.toArray()).toEqual([[1, 2, 3]]);
  });

  it("fromJson is the same function as toJson", () => {
    expect(fromJson).toBe(toJson);
  });

  it("intoLines joins an array with newlines", () => {
    const s = new Stack();
    s.push(["a", "b", "c"]);
    intoLines(s);
    expect(s.toArray()).toEqual(["a\nb\nc"]);
  });

  it("toLines splits a string by newline", () => {
    const s = new Stack();
    s.push("a\nb\nc");
    toLines(s);
    expect(s.toArray()).toEqual([["a", "b", "c"]]);
  });

  it("fromLines splits a string by newline (alias for toLines)", () => {
    const s = new Stack();
    s.push("x\ny\nz");
    fromLines(s);
    expect(s.toArray()).toEqual([["x", "y", "z"]]);
  });

  it("fromLines splits a single line into one-element array", () => {
    const s = new Stack();
    s.push("single");
    fromLines(s);
    expect(s.toArray()).toEqual([["single"]]);
  });

  it("fromLines is the same function as toLines", () => {
    expect(fromLines).toBe(toLines);
  });
});
