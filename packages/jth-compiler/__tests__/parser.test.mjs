import { describe, it, expect } from "vitest";
import { lex } from "../src/lexer.mjs";
import { parse } from "../src/parser.mjs";
import { JthParserError } from "jth-types/errors";

/**
 * Helper: lex then parse.
 */
function parseSrc(source) {
  return parse(lex(source));
}

/**
 * Helper: parse and return the first statement's expressions.
 */
function firstStmt(source) {
  const ast = parseSrc(source);
  return ast.body[0];
}

/**
 * Helper: parse and return the first expression of the first statement.
 */
function firstExpr(source) {
  return firstStmt(source).expressions[0];
}

// ---------------------------------------------------------------------------
// Program structure
// ---------------------------------------------------------------------------
describe("parser: program structure", () => {
  it("should parse an empty program", () => {
    const ast = parseSrc("");
    expect(ast.type).toBe("Program");
    expect(ast.body).toEqual([]);
  });

  it("should parse multiple statements", () => {
    const ast = parseSrc("1 2 +; 3 4 *;");
    expect(ast.type).toBe("Program");
    expect(ast.body).toHaveLength(2);
    expect(ast.body[0].type).toBe("Statement");
    expect(ast.body[1].type).toBe("Statement");
  });

  it("should skip bare semicolons", () => {
    const ast = parseSrc(";;; 1;");
    expect(ast.body).toHaveLength(1);
  });

  it("should skip top-level comments", () => {
    const ast = parseSrc("// comment\n1;");
    expect(ast.body).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Literals
// ---------------------------------------------------------------------------
describe("parser: number literals", () => {
  it("should parse integer 42", () => {
    const expr = firstExpr("42;");
    expect(expr.type).toBe("NumberLiteral");
    expect(expr.value).toBe(42);
  });

  it("should parse float 3.14", () => {
    const expr = firstExpr("3.14;");
    expect(expr.type).toBe("NumberLiteral");
    expect(expr.value).toBeCloseTo(3.14);
  });

  it("should parse negative number", () => {
    const expr = firstExpr("-5;");
    expect(expr.type).toBe("NumberLiteral");
    expect(expr.value).toBe(-5);
  });

  it("should parse hex number", () => {
    const expr = firstExpr("0xFF;");
    expect(expr.type).toBe("NumberLiteral");
    expect(expr.value).toBe(255);
  });
});

describe("parser: string literals", () => {
  it('should parse "hello"', () => {
    const expr = firstExpr('"hello";');
    expect(expr.type).toBe("StringLiteral");
    expect(expr.value).toBe("hello");
  });

  it("should parse 'world'", () => {
    const expr = firstExpr("'world';");
    expect(expr.type).toBe("StringLiteral");
    expect(expr.value).toBe("world");
  });
});

describe("parser: boolean literals", () => {
  it("should parse true", () => {
    const expr = firstExpr("true;");
    expect(expr.type).toBe("BooleanLiteral");
    expect(expr.value).toBe(true);
  });

  it("should parse false", () => {
    const expr = firstExpr("false;");
    expect(expr.type).toBe("BooleanLiteral");
    expect(expr.value).toBe(false);
  });
});

describe("parser: null and undefined", () => {
  it("should parse null", () => {
    const expr = firstExpr("null;");
    expect(expr.type).toBe("NullLiteral");
    expect(expr.value).toBe(null);
  });

  it("should parse undefined", () => {
    const expr = firstExpr("undefined;");
    expect(expr.type).toBe("UndefinedLiteral");
    expect(expr.value).toBe(undefined);
  });
});

// ---------------------------------------------------------------------------
// Operator calls
// ---------------------------------------------------------------------------
describe("parser: operator calls", () => {
  it("should parse + as OperatorCall", () => {
    const expr = firstExpr("+;");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("+");
    expect(expr.args).toEqual([]);
  });

  it("should parse named operator (identifier) as OperatorCall", () => {
    const expr = firstExpr("dupe;");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("dupe");
    expect(expr.args).toEqual([]);
  });

  it("should parse configured operator sort(false)", () => {
    const expr = firstExpr("sort(false);");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("sort");
    expect(expr.args).toHaveLength(1);
    expect(expr.args[0].type).toBe("BooleanLiteral");
    expect(expr.args[0].value).toBe(false);
  });

  it("should parse configured operator keepN(3)", () => {
    const expr = firstExpr("keepN(3);");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("keepN");
    expect(expr.args).toHaveLength(1);
    expect(expr.args[0].type).toBe("NumberLiteral");
    expect(expr.args[0].value).toBe(3);
  });

  it("should parse configured operator with multiple args", () => {
    const expr = firstExpr('range(1 10);');
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("range");
    expect(expr.args).toHaveLength(2);
    expect(expr.args[0].value).toBe(1);
    expect(expr.args[1].value).toBe(10);
  });

  it("should parse dynamic operator 3+ as OperatorCall", () => {
    const expr = firstExpr("3+;");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("3+");
  });

  it("should parse hyperoperator *** as OperatorCall", () => {
    const expr = firstExpr("***;");
    expect(expr.type).toBe("OperatorCall");
    expect(expr.name).toBe("***");
  });
});

// ---------------------------------------------------------------------------
// Statements with multiple expressions
// ---------------------------------------------------------------------------
describe("parser: statements", () => {
  it("should parse 1 2 + as three expressions in one statement", () => {
    const stmt = firstStmt("1 2 +;");
    expect(stmt.expressions).toHaveLength(3);
    expect(stmt.expressions[0].type).toBe("NumberLiteral");
    expect(stmt.expressions[1].type).toBe("NumberLiteral");
    expect(stmt.expressions[2].type).toBe("OperatorCall");
  });

  it("should parse definition: #[ dupe * ] :square;", () => {
    const stmt = firstStmt("#[ dupe * ] :square;");
    expect(stmt.expressions).toHaveLength(2);
    expect(stmt.expressions[0].type).toBe("BlockLiteral");
    expect(stmt.expressions[1].type).toBe("Definition");
    expect(stmt.expressions[1].name).toBe("square");
  });

  it("should parse value definition: 3.14 ::pi;", () => {
    const stmt = firstStmt("3.14 ::pi;");
    expect(stmt.expressions).toHaveLength(2);
    expect(stmt.expressions[0].type).toBe("NumberLiteral");
    expect(stmt.expressions[1].type).toBe("ValueDefinition");
    expect(stmt.expressions[1].name).toBe("pi");
  });
});

// ---------------------------------------------------------------------------
// Block literals
// ---------------------------------------------------------------------------
describe("parser: block literals", () => {
  it("should parse #[ dupe * ]", () => {
    const expr = firstExpr("#[ dupe * ];");
    expect(expr.type).toBe("BlockLiteral");
    expect(expr.body).toHaveLength(2);
    expect(expr.body[0].type).toBe("OperatorCall");
    expect(expr.body[0].name).toBe("dupe");
    expect(expr.body[1].type).toBe("OperatorCall");
    expect(expr.body[1].name).toBe("*");
  });

  it("should parse empty block", () => {
    const expr = firstExpr("#[];");
    expect(expr.type).toBe("BlockLiteral");
    expect(expr.body).toHaveLength(0);
  });

  it("should parse nested blocks", () => {
    const expr = firstExpr("#[ #[ 1 ] ];");
    expect(expr.type).toBe("BlockLiteral");
    expect(expr.body).toHaveLength(1);
    expect(expr.body[0].type).toBe("BlockLiteral");
    expect(expr.body[0].body).toHaveLength(1);
    expect(expr.body[0].body[0].type).toBe("NumberLiteral");
  });

  it("should throw on unterminated block", () => {
    expect(() => parseSrc("#[ 1 2")).toThrow(JthParserError);
  });
});

// ---------------------------------------------------------------------------
// Array literals
// ---------------------------------------------------------------------------
describe("parser: array literals", () => {
  it("should parse [1 2 3]", () => {
    const expr = firstExpr("[1 2 3];");
    expect(expr.type).toBe("ArrayLiteral");
    expect(expr.elements).toHaveLength(3);
    expect(expr.elements[0].type).toBe("NumberLiteral");
    expect(expr.elements[0].value).toBe(1);
    expect(expr.elements[1].value).toBe(2);
    expect(expr.elements[2].value).toBe(3);
  });

  it("should parse empty array", () => {
    const expr = firstExpr("[];");
    expect(expr.type).toBe("ArrayLiteral");
    expect(expr.elements).toHaveLength(0);
  });

  it("should parse nested arrays", () => {
    const expr = firstExpr("[[1] [2]];");
    expect(expr.type).toBe("ArrayLiteral");
    expect(expr.elements).toHaveLength(2);
    expect(expr.elements[0].type).toBe("ArrayLiteral");
    expect(expr.elements[1].type).toBe("ArrayLiteral");
  });

  it("should throw on unterminated array", () => {
    expect(() => parseSrc("[1 2")).toThrow(JthParserError);
  });
});

// ---------------------------------------------------------------------------
// JS Object literals
// ---------------------------------------------------------------------------
describe("parser: JS object literals", () => {
  it('should parse { "key" "value" }', () => {
    const expr = firstExpr('{ "key" "value" };');
    expect(expr.type).toBe("JSObjectLiteral");
    expect(expr.properties).toHaveLength(2);
    expect(expr.properties[0].type).toBe("StringLiteral");
    expect(expr.properties[0].value).toBe("key");
    expect(expr.properties[1].type).toBe("StringLiteral");
    expect(expr.properties[1].value).toBe("value");
  });

  it("should parse empty object", () => {
    const expr = firstExpr("{ };");
    expect(expr.type).toBe("JSObjectLiteral");
    expect(expr.properties).toHaveLength(0);
  });

  it("should throw on unterminated object", () => {
    expect(() => parseSrc('{ "key"')).toThrow(JthParserError);
  });
});

// ---------------------------------------------------------------------------
// Inline JS
// ---------------------------------------------------------------------------
describe("parser: inline JS", () => {
  it("should parse ((x) => x + 1)", () => {
    const expr = firstExpr("((x) => x + 1);");
    expect(expr.type).toBe("InlineJSExpression");
    expect(expr.code).toBe("((x) => x + 1)");
  });

  it("should parse inline JS assignment", () => {
    const stmt = firstStmt("((x) => x * 2) :doubler;");
    expect(stmt.expressions).toHaveLength(2);
    expect(stmt.expressions[0].type).toBe("InlineJSExpression");
    expect(stmt.expressions[1].type).toBe("Definition");
    expect(stmt.expressions[1].name).toBe("doubler");
  });
});

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
describe("parser: imports", () => {
  it('should parse ::import "./math.jth" { square cube }', () => {
    const expr = firstExpr('::import "./math.jth" { square cube };');
    expect(expr.type).toBe("Import");
    expect(expr.path).toBe("./math.jth");
    expect(expr.bindings).toEqual(["square", "cube"]);
  });

  it('should parse ::import without bindings', () => {
    const expr = firstExpr('::import "./lib.jth";');
    expect(expr.type).toBe("Import");
    expect(expr.path).toBe("./lib.jth");
    expect(expr.bindings).toEqual([]);
  });

  it("should throw if path is missing", () => {
    expect(() => parseSrc("::import;")).toThrow(JthParserError);
  });
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
describe("parser: exports", () => {
  it("should parse ::export square", () => {
    const expr = firstExpr("::export square;");
    expect(expr.type).toBe("Export");
    expect(expr.names).toEqual(["square"]);
  });

  it("should parse ::export with multiple names", () => {
    const expr = firstExpr("::export foo bar baz;");
    expect(expr.type).toBe("Export");
    expect(expr.names).toEqual(["foo", "bar", "baz"]);
  });
});

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
describe("parser: comments", () => {
  it("should strip comments from code", () => {
    const ast = parseSrc("1 2 // comment\n+ ;");
    expect(ast.body).toHaveLength(2);
    // First statement: [1, 2] terminated by comment
    expect(ast.body[0].expressions).toHaveLength(2);
    expect(ast.body[0].expressions[0].value).toBe(1);
    expect(ast.body[0].expressions[1].value).toBe(2);
    // Second statement: [+] terminated by semicolon
    expect(ast.body[1].expressions).toHaveLength(1);
    expect(ast.body[1].expressions[0].name).toBe("+");
  });

  it("should handle comment-only input", () => {
    const ast = parseSrc("// just a comment");
    expect(ast.body).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Full programs
// ---------------------------------------------------------------------------
describe("parser: full programs", () => {
  it("should parse a simple program: 5 square peek;", () => {
    const ast = parseSrc("5 square peek;");
    expect(ast.body).toHaveLength(1);
    const stmt = ast.body[0];
    expect(stmt.expressions).toHaveLength(3);
    expect(stmt.expressions[0].type).toBe("NumberLiteral");
    expect(stmt.expressions[0].value).toBe(5);
    expect(stmt.expressions[1].type).toBe("OperatorCall");
    expect(stmt.expressions[1].name).toBe("square");
    expect(stmt.expressions[2].type).toBe("OperatorCall");
    expect(stmt.expressions[2].name).toBe("peek");
  });

  it("should parse block definition + usage", () => {
    const ast = parseSrc("#[ dupe * ] :square; 5 square peek;");
    expect(ast.body).toHaveLength(2);

    // First statement: block + definition
    const def = ast.body[0];
    expect(def.expressions[0].type).toBe("BlockLiteral");
    expect(def.expressions[1].type).toBe("Definition");

    // Second statement: number + call + print
    const use = ast.body[1];
    expect(use.expressions).toHaveLength(3);
  });

  it("should parse array with spread", () => {
    const ast = parseSrc("[1 2 3] spread + + peek;");
    expect(ast.body).toHaveLength(1);
    const stmt = ast.body[0];
    expect(stmt.expressions[0].type).toBe("ArrayLiteral");
    expect(stmt.expressions[1].name).toBe("spread");
  });

  it("should handle mixed definitions and operations", () => {
    const ast = parseSrc(`
      3.14 ::pi;
      #[ dupe * ] :square;
      pi square peek;
    `);
    expect(ast.body).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
describe("parser: errors", () => {
  it("should throw on unexpected token", () => {
    // OBJECT_CLOSE without OBJECT_OPEN
    expect(() => parseSrc("};")).toThrow(JthParserError);
  });

  it("should throw on unterminated block", () => {
    expect(() => parseSrc("#[ 1")).toThrow(JthParserError);
  });

  it("should throw on unterminated array", () => {
    expect(() => parseSrc("[1")).toThrow(JthParserError);
  });

  it("should throw on unterminated object", () => {
    expect(() => parseSrc('{ "a"')).toThrow(JthParserError);
  });
});
