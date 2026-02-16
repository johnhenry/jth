import { describe, it, expect } from "vitest";
import { TokenType, token } from "../src/tokens.mjs";

describe("TokenType", () => {
  it("has all expected token types", () => {
    const expected = [
      "NUMBER", "STRING", "BOOLEAN", "NULL", "UNDEFINED",
      "IDENTIFIER", "OPERATOR",
      "DEFINITION", "VALUE_DEFINITION",
      "IMPORT", "EXPORT",
      "BLOCK_OPEN",
      "OBJECT_OPEN", "OBJECT_CLOSE",
      "ARRAY_OPEN", "ARRAY_CLOSE",
      "PAREN_OPEN", "PAREN_CLOSE",
      "INLINE_JS",
      "SEMICOLON",
      "COMMENT",
      "EOF",
    ];
    for (const name of expected) {
      expect(TokenType[name]).toBeDefined();
    }
  });

  it("all values are distinct", () => {
    const values = Object.values(TokenType);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("is frozen (immutable)", () => {
    expect(Object.isFrozen(TokenType)).toBe(true);
  });
});

describe("token factory", () => {
  it("produces a token object with all fields", () => {
    const t = token(TokenType.NUMBER, 42, 1, 5);
    expect(t).toEqual({ type: "NUMBER", value: 42, line: 1, column: 5 });
  });

  it("handles string tokens", () => {
    const t = token(TokenType.STRING, "hello", 3, 10);
    expect(t.type).toBe("STRING");
    expect(t.value).toBe("hello");
    expect(t.line).toBe(3);
    expect(t.column).toBe(10);
  });

  it("handles operator tokens", () => {
    const t = token(TokenType.OPERATOR, "+", 1, 1);
    expect(t.type).toBe("OPERATOR");
    expect(t.value).toBe("+");
  });
});
