import { describe, it, expect } from "vitest";
import { lex } from "../src/lexer.mjs";
import { TokenType } from "jth-types/tokens";
import { JthLexerError } from "jth-types/errors";

/**
 * Helper: lex source and return tokens without the trailing EOF.
 */
function lexNoEof(source) {
  const tokens = lex(source);
  return tokens.filter((t) => t.type !== TokenType.EOF);
}

/**
 * Helper: lex source and return only the first token.
 */
function first(source) {
  return lex(source)[0];
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------
describe("lexer: numbers", () => {
  it("should lex an integer", () => {
    const tok = first("42");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(42);
  });

  it("should lex zero", () => {
    const tok = first("0");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(0);
  });

  it("should lex a float", () => {
    const tok = first("3.14");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBeCloseTo(3.14);
  });

  it("should lex a negative integer", () => {
    const tok = first("-5");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(-5);
  });

  it("should lex a negative float", () => {
    const tok = first("-0.5");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBeCloseTo(-0.5);
  });

  it("should lex hex number 0xFF", () => {
    const tok = first("0xFF");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(255);
  });

  it("should lex hex number 0x1A", () => {
    const tok = first("0x1A");
    expect(tok.type).toBe(TokenType.NUMBER);
    expect(tok.value).toBe(26);
  });

  it("should treat minus as operator when preceded by a number", () => {
    const tokens = lexNoEof("5 - 3");
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe(5);
    expect(tokens[1].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].value).toBe("-");
    expect(tokens[2].type).toBe(TokenType.NUMBER);
    expect(tokens[2].value).toBe(3);
  });

  it("should lex negative number after operator", () => {
    const tokens = lexNoEof("+ -3");
    expect(tokens[0].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].value).toBe(-3);
  });

  it("should lex negative number after open bracket", () => {
    const tokens = lexNoEof("[-1]");
    expect(tokens[0].type).toBe(TokenType.ARRAY_OPEN);
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].value).toBe(-1);
    expect(tokens[2].type).toBe(TokenType.ARRAY_CLOSE);
  });
});

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------
describe("lexer: strings", () => {
  it("should lex a double-quoted string", () => {
    const tok = first('"hello"');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("hello");
  });

  it("should lex a single-quoted string", () => {
    const tok = first("'world'");
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("world");
  });

  it("should lex a backtick string", () => {
    const tok = first("`template`");
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("template");
  });

  it("should lex an empty string", () => {
    const tok = first('""');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("");
  });

  it("should handle escape sequences in strings", () => {
    const tok = first('"hello\\nworld"');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("hello\nworld");
  });

  it("should handle escaped quotes", () => {
    const tok = first('"say \\"hi\\""');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe('say "hi"');
  });

  it("should lex strings with spaces", () => {
    const tok = first('"hello world"');
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("hello world");
  });

  it("should throw on unterminated string", () => {
    expect(() => lex('"hello')).toThrow(JthLexerError);
  });

  it("should throw on unterminated string with newline (non-backtick)", () => {
    expect(() => lex('"hello\nworld"')).toThrow(JthLexerError);
  });

  it("should allow newlines in backtick strings", () => {
    const tok = first("`hello\nworld`");
    expect(tok.type).toBe(TokenType.STRING);
    expect(tok.value).toBe("hello\nworld");
  });
});

// ---------------------------------------------------------------------------
// Booleans
// ---------------------------------------------------------------------------
describe("lexer: booleans", () => {
  it("should lex true", () => {
    const tok = first("true");
    expect(tok.type).toBe(TokenType.BOOLEAN);
    expect(tok.value).toBe(true);
  });

  it("should lex false", () => {
    const tok = first("false");
    expect(tok.type).toBe(TokenType.BOOLEAN);
    expect(tok.value).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Null / Undefined
// ---------------------------------------------------------------------------
describe("lexer: null and undefined", () => {
  it("should lex null", () => {
    const tok = first("null");
    expect(tok.type).toBe(TokenType.NULL);
    expect(tok.value).toBe(null);
  });

  it("should lex undefined", () => {
    const tok = first("undefined");
    expect(tok.type).toBe(TokenType.UNDEFINED);
    expect(tok.value).toBe(undefined);
  });
});

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------
describe("lexer: identifiers", () => {
  it("should lex a simple identifier", () => {
    const tok = first("dupe");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("dupe");
  });

  it("should lex a hyphenated identifier", () => {
    const tok = first("drop-when");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("drop-when");
  });

  it("should lex a predicate identifier ending with ?", () => {
    const tok = first("string?");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("string?");
  });

  it("should lex identifier with underscore", () => {
    const tok = first("_private");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("_private");
  });

  it("should lex identifier with digits", () => {
    const tok = first("vec3d");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("vec3d");
  });

  it("should lex identifier to-json", () => {
    const tok = first("to-json");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("to-json");
  });

  it("should lex strcat as identifier", () => {
    const tok = first("strcat");
    expect(tok.type).toBe(TokenType.IDENTIFIER);
    expect(tok.value).toBe("strcat");
  });
});

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------
describe("lexer: operators", () => {
  it("should lex +", () => {
    const tok = first("+");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("+");
  });

  it("should lex -", () => {
    // Standalone minus (not before a digit at start) — need context
    const tokens = lexNoEof("5 -");
    expect(tokens[1].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].value).toBe("-");
  });

  it("should lex *", () => {
    const tok = first("*");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("*");
  });

  it("should lex /", () => {
    // Need to ensure it's not confused with comment
    const tokens = lexNoEof("5 /");
    expect(tokens[1].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].value).toBe("/");
  });

  it("should lex **", () => {
    const tok = first("**");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("**");
  });

  it("should lex =", () => {
    const tok = first("=");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("=");
  });

  it("should lex ==", () => {
    const tok = first("==");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("==");
  });

  it("should lex <", () => {
    const tok = first("<");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("<");
  });

  it("should lex <=", () => {
    const tok = first("<=");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("<=");
  });

  it("should lex >", () => {
    const tok = first(">");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe(">");
  });

  it("should lex >=", () => {
    const tok = first(">=");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe(">=");
  });

  it("should lex <=>", () => {
    const tok = first("<=>");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("<=>");
  });

  it("should lex $", () => {
    const tok = first("$");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("$");
  });

  it("should lex $$", () => {
    const tok = first("$$");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("$$");
  });

  it("should lex ...", () => {
    const tok = first("...");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("...");
  });

  it("should lex %", () => {
    const tok = first("%");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("%");
  });

  it("should lex %%", () => {
    const tok = first("%%");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("%%");
  });

  it("should lex ++", () => {
    const tok = first("++");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("++");
  });

  it("should lex --", () => {
    const tok = first("--");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("--");
  });

  it("should lex ~~", () => {
    const tok = first("~~");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("~~");
  });

  it("should lex &&", () => {
    const tok = first("&&");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("&&");
  });

  it("should lex ||", () => {
    const tok = first("||");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("||");
  });

  it("should lex <<-", () => {
    const tok = first("<<-");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("<<-");
  });

  it("should lex ->>", () => {
    const tok = first("->>");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("->>");
  });
});

// ---------------------------------------------------------------------------
// Hyperoperators (3+ stars)
// ---------------------------------------------------------------------------
describe("lexer: hyperoperators", () => {
  it("should lex *** as hyperoperator", () => {
    const tok = first("***");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("***");
  });

  it("should lex **** as hyperoperator", () => {
    const tok = first("****");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("****");
  });

  it("should lex ***** as hyperoperator", () => {
    const tok = first("*****");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("*****");
  });
});

// ---------------------------------------------------------------------------
// Dynamic operators
// ---------------------------------------------------------------------------
describe("lexer: dynamic operators", () => {
  it("should lex 3+ as a single operator token", () => {
    const tok = first("3+");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("3+");
  });

  it("should lex 14* as a single operator token", () => {
    const tok = first("14*");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("14*");
  });

  it("should lex 2log as a single operator token", () => {
    const tok = first("2log");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("2log");
  });

  it("should lex number then space then operator as separate tokens", () => {
    const tokens = lexNoEof("3 +");
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe(3);
    expect(tokens[1].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].value).toBe("+");
  });
});

// ---------------------------------------------------------------------------
// Delimiters
// ---------------------------------------------------------------------------
describe("lexer: delimiters", () => {
  it("should lex #[ as BLOCK_OPEN", () => {
    const tok = first("#[");
    expect(tok.type).toBe(TokenType.BLOCK_OPEN);
    expect(tok.value).toBe("#[");
  });

  it("should lex { as OBJECT_OPEN", () => {
    const tok = first("{");
    expect(tok.type).toBe(TokenType.OBJECT_OPEN);
  });

  it("should lex } as OBJECT_CLOSE", () => {
    const tokens = lexNoEof("{ }");
    expect(tokens[1].type).toBe(TokenType.OBJECT_CLOSE);
  });

  it("should lex [ as ARRAY_OPEN", () => {
    const tok = first("[");
    expect(tok.type).toBe(TokenType.ARRAY_OPEN);
  });

  it("should lex ] as ARRAY_CLOSE", () => {
    const tokens = lexNoEof("[ ]");
    expect(tokens[1].type).toBe(TokenType.ARRAY_CLOSE);
  });

  it("should lex ( as PAREN_OPEN", () => {
    // Must not be followed by ( to avoid inline JS
    const tokens = lexNoEof("sort(");
    expect(tokens[1].type).toBe(TokenType.PAREN_OPEN);
  });

  it("should lex ) as PAREN_CLOSE", () => {
    const tokens = lexNoEof("sort(false)");
    expect(tokens[3].type).toBe(TokenType.PAREN_CLOSE);
  });
});

// ---------------------------------------------------------------------------
// Definitions and Value Definitions
// ---------------------------------------------------------------------------
describe("lexer: definitions", () => {
  it("should lex :square as DEFINITION", () => {
    const tok = first(":square");
    expect(tok.type).toBe(TokenType.DEFINITION);
    expect(tok.value).toBe("square");
  });

  it("should lex :my-func as DEFINITION", () => {
    const tok = first(":my-func");
    expect(tok.type).toBe(TokenType.DEFINITION);
    expect(tok.value).toBe("my-func");
  });

  it("should lex ::pi as VALUE_DEFINITION", () => {
    const tok = first("::pi");
    expect(tok.type).toBe(TokenType.VALUE_DEFINITION);
    expect(tok.value).toBe("pi");
  });

  it("should lex ::my-val as VALUE_DEFINITION", () => {
    const tok = first("::my-val");
    expect(tok.type).toBe(TokenType.VALUE_DEFINITION);
    expect(tok.value).toBe("my-val");
  });
});

// ---------------------------------------------------------------------------
// Directives
// ---------------------------------------------------------------------------
describe("lexer: directives", () => {
  it("should lex ::import as IMPORT", () => {
    const tok = first('::import "./lib.jth"');
    expect(tok.type).toBe(TokenType.IMPORT);
  });

  it("should lex ::export as EXPORT", () => {
    const tok = first("::export foo");
    expect(tok.type).toBe(TokenType.EXPORT);
  });
});

// ---------------------------------------------------------------------------
// Inline JS
// ---------------------------------------------------------------------------
describe("lexer: inline JS", () => {
  it("should lex ((x) => x * 2) as INLINE_JS", () => {
    const tok = first("((x) => x * 2)");
    expect(tok.type).toBe(TokenType.INLINE_JS);
    expect(tok.value).toBe("((x) => x * 2)");
  });

  it("should lex inline JS with nested parens", () => {
    const tok = first("((a, b) => (a + b))");
    expect(tok.type).toBe(TokenType.INLINE_JS);
    expect(tok.value).toBe("((a, b) => (a + b))");
  });

  it("should throw on unterminated inline JS", () => {
    expect(() => lex("((x) => x * 2")).toThrow(JthLexerError);
  });
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
describe("lexer: comments", () => {
  it("should lex // comment as COMMENT", () => {
    const tok = first("// this is a comment");
    expect(tok.type).toBe(TokenType.COMMENT);
    expect(tok.value).toBe("this is a comment");
  });

  it("should lex comment after code", () => {
    const tokens = lexNoEof("42 // a number");
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[1].type).toBe(TokenType.COMMENT);
    expect(tokens[1].value).toBe("a number");
  });

  it("should not confuse / operator with comment", () => {
    const tokens = lexNoEof("5 /");
    expect(tokens[1].type).toBe(TokenType.OPERATOR);
    expect(tokens[1].value).toBe("/");
  });

  it("should lex # comment as COMMENT", () => {
    const tok = first("# this is a comment");
    expect(tok.type).toBe(TokenType.COMMENT);
    expect(tok.value).toBe("this is a comment");
  });

  it("should lex # comment after code", () => {
    const tokens = lexNoEof("42 # a number");
    expect(tokens).toHaveLength(2);
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe(42);
    expect(tokens[1].type).toBe(TokenType.COMMENT);
    expect(tokens[1].value).toBe("a number");
  });

  it("should produce no non-comment tokens for a line that is only a # comment", () => {
    const tokens = lexNoEof("# this is a comment");
    const nonComment = tokens.filter((t) => t.type !== TokenType.COMMENT);
    expect(nonComment).toHaveLength(0);
  });

  it("should not confuse #[ block open with # comment", () => {
    const tok = first("#[");
    expect(tok.type).toBe(TokenType.BLOCK_OPEN);
    expect(tok.value).toBe("#[");
  });
});

// ---------------------------------------------------------------------------
// Semicolons
// ---------------------------------------------------------------------------
describe("lexer: semicolons", () => {
  it("should lex ; as SEMICOLON", () => {
    const tok = first(";");
    expect(tok.type).toBe(TokenType.SEMICOLON);
  });

  it("should lex semicolons between expressions", () => {
    const tokens = lexNoEof("1 2 +; 3 4 *;");
    const semis = tokens.filter((t) => t.type === TokenType.SEMICOLON);
    expect(semis).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Unicode operators
// ---------------------------------------------------------------------------
describe("lexer: unicode operators", () => {
  it("should lex Sigma as OPERATOR", () => {
    const tok = first("\u03A3");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("\u03A3");
  });

  it("should lex empty set as OPERATOR", () => {
    const tok = first("\u2205");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("\u2205");
  });

  it("should lex sqrt as OPERATOR", () => {
    const tok = first("\u221A");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("\u221A");
  });

  it("should lex division sign as OPERATOR", () => {
    const tok = first("\u00F7");
    expect(tok.type).toBe(TokenType.OPERATOR);
    expect(tok.value).toBe("\u00F7");
  });
});

// ---------------------------------------------------------------------------
// EOF
// ---------------------------------------------------------------------------
describe("lexer: EOF", () => {
  it("should always end with EOF", () => {
    const tokens = lex("");
    expect(tokens).toHaveLength(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });

  it("should end with EOF after tokens", () => {
    const tokens = lex("42");
    expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
  });
});

// ---------------------------------------------------------------------------
// Line and column tracking
// ---------------------------------------------------------------------------
describe("lexer: line/column tracking", () => {
  it("should track line 1 column 1 for first token", () => {
    const tok = first("42");
    expect(tok.line).toBe(1);
    expect(tok.column).toBe(1);
  });

  it("should track column after spaces", () => {
    const tokens = lexNoEof("  42");
    expect(tokens[0].line).toBe(1);
    expect(tokens[0].column).toBe(3);
  });

  it("should track lines across newlines", () => {
    const tokens = lexNoEof("42\n99");
    expect(tokens[0].line).toBe(1);
    expect(tokens[1].line).toBe(2);
    expect(tokens[1].column).toBe(1);
  });

  it("should track lines and columns through multiple lines", () => {
    const tokens = lexNoEof("1\n2\n  3");
    expect(tokens[0].line).toBe(1);
    expect(tokens[1].line).toBe(2);
    expect(tokens[2].line).toBe(3);
    expect(tokens[2].column).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Complex token sequences
// ---------------------------------------------------------------------------
describe("lexer: complex sequences", () => {
  it("should lex 1 2 + peek;", () => {
    const tokens = lexNoEof("1 2 + peek;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.NUMBER,
      TokenType.NUMBER,
      TokenType.OPERATOR,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
    ]);
    expect(tokens[0].value).toBe(1);
    expect(tokens[1].value).toBe(2);
    expect(tokens[2].value).toBe("+");
    expect(tokens[3].value).toBe("peek");
  });

  it('should lex "hello" "world" strcat peek;', () => {
    const tokens = lexNoEof('"hello" "world" strcat peek;');
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.STRING,
      TokenType.STRING,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
    ]);
  });

  it("should lex #[ dupe * ] :square;", () => {
    const tokens = lexNoEof("#[ dupe * ] :square;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.BLOCK_OPEN,
      TokenType.IDENTIFIER,
      TokenType.OPERATOR,
      TokenType.ARRAY_CLOSE,
      TokenType.DEFINITION,
      TokenType.SEMICOLON,
    ]);
    expect(tokens[4].value).toBe("square");
  });

  it("should lex 3.14 ::pi;", () => {
    const tokens = lexNoEof("3.14 ::pi;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.NUMBER,
      TokenType.VALUE_DEFINITION,
      TokenType.SEMICOLON,
    ]);
    expect(tokens[0].value).toBeCloseTo(3.14);
    expect(tokens[1].value).toBe("pi");
  });

  it("should lex true false and peek;", () => {
    const tokens = lexNoEof("true false and peek;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.BOOLEAN,
      TokenType.BOOLEAN,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
    ]);
  });

  it("should lex [1 2 3]", () => {
    const tokens = lexNoEof("[1 2 3]");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.ARRAY_OPEN,
      TokenType.NUMBER,
      TokenType.NUMBER,
      TokenType.NUMBER,
      TokenType.ARRAY_CLOSE,
    ]);
  });

  it('should lex { "key" "value" }', () => {
    const tokens = lexNoEof('{ "key" "value" }');
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.OBJECT_OPEN,
      TokenType.STRING,
      TokenType.STRING,
      TokenType.OBJECT_CLOSE,
    ]);
  });

  it("should lex sort(false)", () => {
    const tokens = lexNoEof("sort(false)");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.IDENTIFIER,
      TokenType.PAREN_OPEN,
      TokenType.BOOLEAN,
      TokenType.PAREN_CLOSE,
    ]);
  });

  it("should lex ((x) => x * 2) :doubler;", () => {
    const tokens = lexNoEof("((x) => x * 2) :doubler;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.INLINE_JS,
      TokenType.DEFINITION,
      TokenType.SEMICOLON,
    ]);
  });

  it('should lex ::import "./math.jth" { square cube }', () => {
    const tokens = lexNoEof('::import "./math.jth" { square cube }');
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.IMPORT,
      TokenType.STRING,
      TokenType.OBJECT_OPEN,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.OBJECT_CLOSE,
    ]);
  });

  it("should lex ::export square;", () => {
    const tokens = lexNoEof("::export square;");
    expect(tokens.map((t) => t.type)).toEqual([
      TokenType.EXPORT,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
    ]);
  });

  it("should lex a multiline program", () => {
    const src = `1 2 +;
3 4 *;`;
    const tokens = lexNoEof(src);
    const nums = tokens.filter((t) => t.type === TokenType.NUMBER);
    expect(nums).toHaveLength(4);
    expect(nums.map((t) => t.value)).toEqual([1, 2, 3, 4]);
  });
});

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------
describe("lexer: errors", () => {
  it("should throw JthLexerError on unknown character", () => {
    expect(() => lex("\u0000")).toThrow(JthLexerError);
  });

  it("should include line and column in error", () => {
    try {
      lex("42\n  \u0000");
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(JthLexerError);
      expect(e.line).toBe(2);
      expect(e.column).toBe(3);
    }
  });

  it("should throw on bare colon with no identifier", () => {
    expect(() => lex(": ")).toThrow(JthLexerError);
  });

  it("should throw on bare double colon with no identifier", () => {
    expect(() => lex(":: ")).toThrow(JthLexerError);
  });
});
