import { describe, it, expect } from "vitest";
import { lex } from "../src/lexer.mjs";
import { parse } from "../src/parser.mjs";
import { generate } from "../src/codegen.mjs";

/** Helper: source → AST → JS (no preamble for cleaner assertions) */
function gen(source) {
  return generate(parse(lex(source)), { preamble: false });
}

/** Helper: source → AST → JS (with preamble) */
function genFull(source) {
  return generate(parse(lex(source)));
}

// ── Preamble ──────────────────────────────────────────────────

describe("preamble", () => {
  it("emits runtime imports, stdlib import, and stack declaration", () => {
    const js = genFull("");
    expect(js).toContain('import { Stack, processN, registry } from "jth-runtime"');
    expect(js).toContain('import "jth-stdlib"');
    expect(js).toContain("const stack = new Stack()");
  });

  it("can be suppressed with preamble: false", () => {
    const js = gen("");
    expect(js).not.toContain("import");
    expect(js).not.toContain("Stack");
  });
});

// ── Literals ──────────────────────────────────────────────────

describe("literals", () => {
  it("number literal", () => {
    const js = gen("42;");
    expect(js).toContain("42");
    expect(js).toContain("processN(stack,");
  });

  it("negative number literal", () => {
    const js = gen("-7;");
    expect(js).toContain("-7");
  });

  it("float literal", () => {
    const js = gen("3.14;");
    expect(js).toContain("3.14");
  });

  it("string literal", () => {
    const js = gen('"hello";');
    expect(js).toContain('"hello"');
  });

  it("string with escapes", () => {
    const js = gen('"line\\none";');
    expect(js).toContain("line\\none");
  });

  it("boolean true", () => {
    const js = gen("true;");
    expect(js).toContain("true");
  });

  it("boolean false", () => {
    const js = gen("false;");
    expect(js).toContain("false");
  });

  it("null literal", () => {
    const js = gen("null;");
    expect(js).toContain("null");
  });

  it("undefined literal", () => {
    const js = gen("undefined;");
    expect(js).toContain("undefined");
  });
});

// ── Operators ─────────────────────────────────────────────────

describe("operators", () => {
  it("operator via registry.resolve", () => {
    const js = gen("+;");
    expect(js).toContain('registry.resolve("+")');
  });

  it("identifier-style operator", () => {
    const js = gen("dupe;");
    expect(js).toContain('registry.resolve("dupe")');
  });

  it("multiple operators in one statement", () => {
    const js = gen("1 2 +;");
    expect(js).toContain("1, 2");
    expect(js).toContain('registry.resolve("+")');
  });

  it("configured operator with boolean arg", () => {
    const js = gen("sort(false);");
    expect(js).toContain("s.push(false)");
    expect(js).toContain('registry.resolve("sort")');
  });

  it("configured operator with number arg", () => {
    const js = gen("keepN(3);");
    expect(js).toContain("s.push(3)");
    expect(js).toContain('registry.resolve("keepN")');
  });

  it("configured operator wraps in a function", () => {
    const js = gen("sort(false);");
    expect(js).toContain("((s) => {");
    expect(js).toContain("return registry.resolve");
  });
});

// ── Block literals ────────────────────────────────────────────

describe("block literals", () => {
  it("compiles block to processN closure", () => {
    const js = gen("#[ dupe ];");
    expect(js).toContain("((s) => processN(s, [");
    expect(js).toContain('registry.resolve("dupe")');
  });

  it("block with multiple ops", () => {
    const js = gen("#[ dupe * ];");
    expect(js).toContain('registry.resolve("dupe")');
    expect(js).toContain('registry.resolve("*")');
  });

  it("nested blocks", () => {
    const js = gen("#[ #[ dupe * ] map ];");
    // Should have two levels of ((s) => processN(s, [...]))
    const matches = js.match(/\(\(s\) => processN\(s,/g);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("block with literal values", () => {
    const js = gen('#[ 1 "hello" + ];');
    expect(js).toContain("1");
    expect(js).toContain('"hello"');
  });
});

// ── Array literals ────────────────────────────────────────────

describe("array literals", () => {
  it("compiles to JS array", () => {
    const js = gen("[1 2 3];");
    expect(js).toContain("[1, 2, 3]");
  });

  it("array with mixed types", () => {
    const js = gen('[1 "two" true];');
    expect(js).toContain("1");
    expect(js).toContain('"two"');
    expect(js).toContain("true");
  });

  it("empty array", () => {
    const js = gen("[];");
    expect(js).toContain("[]");
  });
});

// ── JS Object literals ───────────────────────────────────────

describe("JS object literals", () => {
  it("compiles {} with key-value pairs", () => {
    const js = gen('{ "name" "John" };');
    // Should produce an object expression
    expect(js).toContain('"name"');
    expect(js).toContain('"John"');
  });

  it("compiles {} with multiple pairs", () => {
    const js = gen('{ "a" 1 "b" 2 };');
    expect(js).toContain('"a"');
    expect(js).toContain('"b"');
  });
});

// ── Inline JS ─────────────────────────────────────────────────

describe("inline JS", () => {
  it("passes through inline JS expression", () => {
    const js = gen("((x => x + 1));");
    expect(js).toContain("(x => x + 1)");
  });

  it("inline JS in a statement with other items", () => {
    const js = gen("5 ((x => x * 2));");
    expect(js).toContain("5");
    expect(js).toContain("(x => x * 2)");
  });
});

// ── Definitions :name ─────────────────────────────────────────

describe(":name definitions", () => {
  it("block + :name optimises to registry.set with closure", () => {
    const js = gen("#[ dupe * ] :square;");
    expect(js).toContain('registry.set("square"');
    expect(js).toContain("(s) => processN(s, [");
    expect(js).toContain('registry.resolve("dupe")');
    expect(js).toContain('registry.resolve("*")');
  });

  it("creates a JS const alongside registry.set", () => {
    const js = gen("#[ dupe * ] :square;");
    expect(js).toContain("const square");
  });

  it("value + :name", () => {
    const js = gen("5 :x;");
    expect(js).toContain("processN(stack, [5])");
    expect(js).toContain('registry.set("x"');
  });

  it("no body + :name pops from stack", () => {
    const js = gen(":x;");
    expect(js).toContain("stack.pop()");
    expect(js).toContain('registry.set("x"');
  });

  it("sanitizes hyphenated names", () => {
    const js = gen("#[ 1 ] :my-func;");
    expect(js).toContain("const my_func");
    expect(js).toContain('registry.set("my-func"');
  });

  it("sanitizes predicate names", () => {
    const js = gen("#[ 1 ] :empty?;");
    expect(js).toContain("const empty_p");
    expect(js).toContain('registry.set("empty?"');
  });
});

// ── Value definitions ::name ──────────────────────────────────

describe("::name value definitions", () => {
  it("expression + ::name", () => {
    const js = gen("42 ::x;");
    expect(js).toContain("processN(stack, [42])");
    expect(js).toContain("const x = stack.pop()");
  });

  it("no body + ::name pops from stack", () => {
    const js = gen("::x;");
    expect(js).toContain("const x = stack.pop()");
  });

  it("complex expression + ::name", () => {
    const js = gen("1 2 + ::result;");
    expect(js).toContain('registry.resolve("+")');
    expect(js).toContain("const result = stack.pop()");
  });
});

// ── Imports ───────────────────────────────────────────────────

describe("imports", () => {
  it("bare import", () => {
    const js = gen('::import "./math.jth";');
    expect(js).toContain('import "./math.mjs"');
  });

  it("rewrites .jth to .mjs", () => {
    const js = gen('::import "./lib.jth";');
    expect(js).toContain(".mjs");
    expect(js).not.toContain(".jth");
  });

  it("non-.jth imports are untouched", () => {
    const js = gen('::import "lodash";');
    expect(js).toContain('"lodash"');
  });

  it("import with named bindings", () => {
    const js = gen('::import "./math.jth" { square cube };');
    expect(js).toContain("import { square, cube }");
    expect(js).toContain('"./math.mjs"');
  });
});

// ── Exports ───────────────────────────────────────────────────

describe("exports", () => {
  it("export named values", () => {
    const js = gen("::export square cube;");
    expect(js).toContain("export { square, cube }");
  });

  it("export single name", () => {
    const js = gen("::export main;");
    expect(js).toContain("export { main }");
  });

  it("empty export produces empty string", () => {
    const js = gen("::export;");
    expect(js).toBe("");
  });
});

// ── Top-level await ───────────────────────────────────────────

describe("top-level await", () => {
  it("statements use await processN", () => {
    const js = gen("1 2 +;");
    expect(js).toMatch(/^await processN/);
  });

  it("definitions do not use await for block shortcut", () => {
    const js = gen("#[ 1 ] :x;");
    expect(js).not.toMatch(/^await/);
  });
});

// ── Multiple statements ───────────────────────────────────────

describe("multiple statements", () => {
  it("persistent stack across statements", () => {
    const js = gen("1; 2; +;");
    const lines = js.split("\n");
    // Each becomes a separate processN call on the same stack
    expect(lines.filter((l) => l.includes("processN(stack,")).length).toBe(3);
  });

  it("definition then usage", () => {
    const js = gen("#[ dupe * ] :square; 5 square;");
    expect(js).toContain('registry.set("square"');
    expect(js).toContain('registry.resolve("square")');
  });
});

// ── Comments ──────────────────────────────────────────────────

describe("comments", () => {
  it("comments are stripped from output", () => {
    const js = gen("1 2 + // this adds\n;");
    expect(js).not.toContain("this adds");
    expect(js).not.toContain("//");
  });
});
