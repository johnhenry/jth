import { describe, it, expect } from "vitest";
import { transform } from "../src/transform.mjs";

/** Helper: transform with no preamble for cleaner assertions */
function tx(source) {
  return transform(source, { preamble: false });
}

describe("transform: source → JS round trip", () => {
  it('"hello" peek;', () => {
    const js = tx('"hello" peek;');
    expect(js).toContain('"hello"');
    expect(js).toContain('registry.resolve("peek")');
    expect(js).toContain("processN(stack,");
  });

  it("1 2 +;", () => {
    const js = tx("1 2 +;");
    expect(js).toContain("1, 2");
    expect(js).toContain('registry.resolve("+")');
  });

  it("#[ dupe * ] :square; 5 square;", () => {
    const js = tx("#[ dupe * ] :square; 5 square;");
    expect(js).toContain('registry.set("square"');
    expect(js).toContain('registry.resolve("dupe")');
    expect(js).toContain('registry.resolve("*")');
    expect(js).toContain("5");
    expect(js).toContain('registry.resolve("square")');
  });

  it("import with .jth → .mjs rewrite", () => {
    const js = tx('::import "./math.jth" { square };');
    expect(js).toContain('import { square } from "./math.mjs"');
    expect(js).not.toContain(".jth");
  });

  it("export names", () => {
    const js = tx("::export square cube;");
    expect(js).toContain("export { square, cube }");
  });

  it("comments are stripped", () => {
    const js = tx("// this is a comment\n1 2 +;");
    expect(js).not.toContain("this is a comment");
    expect(js).toContain('registry.resolve("+")');
  });

  it("multiple statements share the same stack", () => {
    const js = tx("1; 2; +; peek;");
    // All use the same stack variable
    const matches = js.match(/processN\(stack,/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(4);
  });

  it("definition then value definition", () => {
    const js = tx("#[ 1 + ] :inc; 5 inc ::result;");
    expect(js).toContain('registry.set("inc"');
    expect(js).toContain("const result = stack.pop()");
  });

  it("full preamble by default", () => {
    const js = transform("1 2 +;");
    expect(js).toContain('import { Stack, processN, registry } from "jth-runtime"');
    expect(js).toContain('import "jth-stdlib"');
    expect(js).toContain("const stack = new Stack()");
  });

  it("inline JS passthrough", () => {
    const js = tx("((x => x + 1));");
    expect(js).toContain("(x => x + 1)");
  });

  it("block-based control flow pattern", () => {
    const js = tx('#[ "yes" ] #[ "no" ] true if;');
    // Two blocks + true + if operator
    expect(js).toContain("((s) => processN(s,");
    expect(js).toContain('registry.resolve("if")');
    expect(js).toContain("true");
  });

  it("array literal in statement", () => {
    const js = tx("[1 2 3] spread +;");
    expect(js).toContain("[1, 2, 3]");
    expect(js).toContain('registry.resolve("spread")');
    expect(js).toContain('registry.resolve("+")');
  });

  it("value definition with complex body", () => {
    const js = tx("1 2 + ::sum;");
    expect(js).toContain('registry.resolve("+")');
    expect(js).toContain("const sum = stack.pop()");
  });
});
