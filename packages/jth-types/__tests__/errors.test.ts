import { describe, it, expect } from "vitest";
import {
  JthError, JthLexerError, JthParserError, JthRuntimeError, StackUnderflowError,
} from "../src/errors.ts";

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

  it("StackUnderflowError extends JthRuntimeError with code, operator and counts", () => {
    const e = new StackUnderflowError({ expected: 2, actual: 1, operator: "swap" }, 3, 4);
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(JthError);
    expect(e).toBeInstanceOf(JthRuntimeError);
    expect(e).toBeInstanceOf(StackUnderflowError);
    expect(e.name).toBe("StackUnderflowError");
    expect(e.code).toBe("STACK_UNDERFLOW");
    expect(e.expected).toBe(2);
    expect(e.actual).toBe(1);
    expect(e.operator).toBe("swap");
    expect(e.line).toBe(3);
    expect(e.column).toBe(4);
    expect(e.message).toContain("swap");
    expect(e.message).toContain("2");
    expect(e.message).toContain("1");
  });

  it("StackUnderflowError without an operator has operator === null and a generic message", () => {
    const e = new StackUnderflowError({ expected: 1, actual: 0 });
    expect(e.operator).toBeNull();
    expect(e.message).toMatch(/underflow/i);
  });

  it("StackUnderflowError.operator can be filled in after the fact and updates the message", () => {
    const e = new StackUnderflowError({ expected: 2, actual: 0 });
    e.withOperator("+");
    expect(e.operator).toBe("+");
    expect(e.message).toContain("+");
    // first attribution wins (innermost operator)
    e.withOperator("outer");
    expect(e.operator).toBe("+");
  });
});
