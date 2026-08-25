import { describe, it, expect } from "vitest";
import { JthRuntimeError } from "@johnhenry/jth-types";
import { run } from "../src/run.ts";
import "@johnhenry/jth-stdlib";

async function captureError(source: string): Promise<any> {
  try {
    await run(source);
  } catch (e) {
    return e;
  }
  throw new Error(`expected "${source}" to throw`);
}

describe("runtime errors carry codes and source positions", () => {
  it("unknown operator: JthRuntimeError with UNKNOWN_OPERATOR and position", async () => {
    const err = await captureError("2 nonexistentop;");
    expect(err).toBeInstanceOf(JthRuntimeError);
    expect(err.code).toBe("UNKNOWN_OPERATOR");
    expect(err.message).toContain("Unknown operator: nonexistentop");
    expect(err.line).toBe(1);
    expect(typeof err.column).toBe("number");
  });

  it("unknown operator: reports the line of the failing statement", async () => {
    const err = await captureError("1 2 +;\n3 nonexistentop;");
    expect(err.line).toBe(2);
  });

  it("unknown operator: suggests the nearest known operator", async () => {
    const err = await captureError("1 2 pluss;");
    expect(err.message).toContain("Unknown operator: pluss");
    expect(err.message).toContain('did you mean "plus"?');
  });

  it("apply on a non-function: TYPE_ERROR with value type name and position", async () => {
    const err = await captureError("5 apply;");
    expect(err).toBeInstanceOf(JthRuntimeError);
    expect(err.code).toBe("TYPE_ERROR");
    expect(err.message).toContain("not a function/block");
    expect(err.message).toContain("(got number)");
    expect(err.line).toBe(1);
  });

  it("record with odd args: RECORD_ODD_ARGS with position", async () => {
    const err = await captureError('1 "a" 2 record;');
    expect(err).toBeInstanceOf(JthRuntimeError);
    expect(err.code).toBe("RECORD_ODD_ARGS");
    expect(err.message).toContain("record requires even number of args");
    expect(err.line).toBe(1);
  });

  it("user throw: USER_THROW code, message preserved", async () => {
    const err = await captureError('"boom" throw;');
    expect(err).toBeInstanceOf(JthRuntimeError);
    expect(err.code).toBe("USER_THROW");
    expect(err.message).toBe("boom");
    expect(err.line).toBe(1);
  });

  it("errors keep the position of the statement that threw, not later ones", async () => {
    const err = await captureError('"x" throw;\n1 2 +;');
    expect(err.line).toBe(1);
  });
});
