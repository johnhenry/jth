import { describe, it, expect } from "vitest";
import {
  JthError, JthLexerError, JthParserError, JthRuntimeError,
} from "../src/errors.mjs";

describe("Error hierarchy", () => {
  it("JthError is an Error", () => {
    const e = new JthError("test", 1, 5);
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(JthError);
    expect(e.name).toBe("JthError");
    expect(e.message).toBe("test");
    expect(e.line).toBe(1);
    expect(e.column).toBe(5);
  });

  it("JthLexerError extends JthError", () => {
    const e = new JthLexerError("bad char", 2, 10);
    expect(e).toBeInstanceOf(JthError);
    expect(e).toBeInstanceOf(JthLexerError);
    expect(e.name).toBe("JthLexerError");
    expect(e.line).toBe(2);
    expect(e.column).toBe(10);
  });

  it("JthParserError extends JthError", () => {
    const e = new JthParserError("unexpected token", 3, 1);
    expect(e).toBeInstanceOf(JthError);
    expect(e).toBeInstanceOf(JthParserError);
    expect(e.name).toBe("JthParserError");
  });

  it("JthRuntimeError extends JthError", () => {
    const e = new JthRuntimeError("stack underflow", 4, 2);
    expect(e).toBeInstanceOf(JthError);
    expect(e).toBeInstanceOf(JthRuntimeError);
    expect(e.name).toBe("JthRuntimeError");
  });

  it("line and column default to null", () => {
    const e = new JthError("no location");
    expect(e.line).toBeNull();
    expect(e.column).toBeNull();
  });

  it("errors have proper stack traces", () => {
    const e = new JthLexerError("test");
    expect(e.stack).toContain("JthLexerError");
  });
});
