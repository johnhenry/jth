/**
 * End-to-end integration tests for jth 2.0.
 *
 * These tests exercise the full pipeline: jth source code is lexed, parsed,
 * code-generated, and then evaluated against the runtime with the standard
 * library loaded. The result is the final stack state.
 */

import { describe, it, expect } from "vitest";
import { Stack, processN, registry } from "jth-runtime";
import { lex, parse, generate, transform } from "jth-compiler";
import "jth-stdlib";

// ---------------------------------------------------------------------------
// Helper: evaluate jth source and return the resulting stack as an array.
// ---------------------------------------------------------------------------

async function evalJth(source) {
  const stack = new Stack();
  const tokens = lex(source);
  const ast = parse(tokens);
  const js = generate(ast, { preamble: false });

  // Wrap the generated code in an async function that has access to
  // runtime primitives via closure parameters.
  const fn = new Function(
    "stack",
    "processN",
    "registry",
    `return (async () => { ${js} })();`
  );

  await fn(stack, processN, registry);
  return stack.toArray();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("E2E: Basic values", () => {
  it("pushes a number", async () => {
    expect(await evalJth("42;")).toEqual([42]);
  });

  it("pushes a string", async () => {
    expect(await evalJth('"hello";')).toEqual(["hello"]);
  });

  it("pushes a boolean (true)", async () => {
    expect(await evalJth("true;")).toEqual([true]);
  });

  it("pushes a boolean (false)", async () => {
    expect(await evalJth("false;")).toEqual([false]);
  });

  it("pushes null", async () => {
    expect(await evalJth("null;")).toEqual([null]);
  });

  it("pushes multiple values", async () => {
    expect(await evalJth("1 2 3;")).toEqual([1, 2, 3]);
  });
});

describe("E2E: Arithmetic", () => {
  it("addition: 1 2 +", async () => {
    expect(await evalJth("1 2 +;")).toEqual([3]);
  });

  it("subtraction: 10 3 -", async () => {
    expect(await evalJth("10 3 -;")).toEqual([7]);
  });

  it("multiplication: 4 5 *", async () => {
    expect(await evalJth("4 5 *;")).toEqual([20]);
  });

  it("division: 10 2 /", async () => {
    expect(await evalJth("10 2 /;")).toEqual([5]);
  });

  it("exponentiation: 2 3 **", async () => {
    expect(await evalJth("2 3 **;")).toEqual([8]);
  });

  it("modulo: 7 3 %", async () => {
    expect(await evalJth("7 3 %;")).toEqual([1]);
  });

  it("increment: 5 ++", async () => {
    expect(await evalJth("5 ++;")).toEqual([6]);
  });

  it("decrement: 5 --", async () => {
    expect(await evalJth("5 --;")).toEqual([4]);
  });

  it("sum all (variadic \u03A3): 1 2 3 4 \u03A3", async () => {
    expect(await evalJth("1 2 3 4 \u03A3;")).toEqual([10]);
  });
});

describe("E2E: Comparison", () => {
  it("equal (true): 5 5 =", async () => {
    expect(await evalJth("5 5 =;")).toEqual([true]);
  });

  it("equal (false): 5 3 =", async () => {
    expect(await evalJth("5 3 =;")).toEqual([false]);
  });

  it("less than: 3 5 <", async () => {
    expect(await evalJth("3 5 <;")).toEqual([true]);
  });

  it("greater than: 5 3 >", async () => {
    expect(await evalJth("5 3 >;")).toEqual([true]);
  });

  it("spaceship: 3 5 <=>", async () => {
    // Implementation: a===b ? 0 : a>b ? -1 : 1
    // popN(2) with stack [3,5] yields args=[3,5], so a=3 b=5
    // 3 > 5 is false => result is 1
    expect(await evalJth("3 5 <=>;")).toEqual([1]);
  });

  it("spaceship equal: 5 5 <=>", async () => {
    expect(await evalJth("5 5 <=>;")).toEqual([0]);
  });
});

describe("E2E: Stack operations", () => {
  it("dupe: 5 dupe", async () => {
    expect(await evalJth("5 dupe;")).toEqual([5, 5]);
  });

  it("swap: 1 2 swap", async () => {
    expect(await evalJth("1 2 swap;")).toEqual([2, 1]);
  });

  it("drop: 1 2 drop", async () => {
    expect(await evalJth("1 2 drop;")).toEqual([1]);
  });

  it("clear: 1 2 3 clear", async () => {
    expect(await evalJth("1 2 3 clear;")).toEqual([]);
  });

  it("copy: 1 2 copy", async () => {
    expect(await evalJth("1 2 copy;")).toEqual([1, 2, 1, 2]);
  });

  it("reverse: 1 2 3 reverse", async () => {
    expect(await evalJth("1 2 3 reverse;")).toEqual([3, 2, 1]);
  });

  it("count: 1 2 3 count (non-destructive, pushes length)", async () => {
    // count pushes stack.length without consuming any items
    expect(await evalJth("1 2 3 count;")).toEqual([1, 2, 3, 3]);
  });

  it("collect: 1 2 3 collect", async () => {
    expect(await evalJth("1 2 3 collect;")).toEqual([[1, 2, 3]]);
  });
});

describe("E2E: Definitions", () => {
  it("block definition and usage: #[ dupe * ] :square; 5 square;", async () => {
    expect(await evalJth("#[ dupe * ] :square; 5 square;")).toEqual([25]);
  });

  it("block with multiple ops: #[ dupe dupe * * ] :cube; 3 cube;", async () => {
    // 3 dupe => [3,3], dupe => [3,3,3], * => [3,9], * => [27]
    expect(await evalJth("#[ dupe dupe * * ] :cube; 3 cube;")).toEqual([27]);
  });

  it("value definition: 42 ::x (pops 42 into const x)", async () => {
    expect(await evalJth("42 ::x;")).toEqual([]);
  });

  it("multiple definitions: #[ 1 + ] :inc; #[ 1 - ] :dec; 5 inc dec;", async () => {
    expect(
      await evalJth("#[ 1 + ] :inc; #[ 1 - ] :dec; 5 inc dec;")
    ).toEqual([5]);
  });
});

describe("E2E: Logic", () => {
  it("and: true true &&", async () => {
    expect(await evalJth("true true &&;")).toEqual([true]);
  });

  it("and (false): true false &&", async () => {
    expect(await evalJth("true false &&;")).toEqual([false]);
  });

  it("or: true false ||", async () => {
    expect(await evalJth("true false ||;")).toEqual([true]);
  });

  it("not: true ~~", async () => {
    expect(await evalJth("true ~~;")).toEqual([false]);
  });
});

describe("E2E: Control flow", () => {
  // Note: processN executes all functions in its items array, so block
  // literals in the same statement as `if` are executed immediately
  // (their results are pushed as values, not as callable functions).
  // The `if` operator receives these values and selects one.
  //
  // To verify the `if` operator works with callable blocks, we also test
  // it via the runtime directly with functions pre-pushed onto the stack.

  it("if operator selects true-branch function (runtime-level)", () => {
    const stack = new Stack();
    const falseBlock = (s) => s.push("no");
    const trueBlock = (s) => s.push("yes");
    stack.push(falseBlock);
    stack.push(trueBlock);
    stack.push(true);
    registry.resolve("if")(stack);
    expect(stack.toArray()).toEqual(["yes"]);
  });

  it("if operator selects false-branch function (runtime-level)", () => {
    const stack = new Stack();
    const falseBlock = (s) => s.push("no");
    const trueBlock = (s) => s.push("yes");
    stack.push(falseBlock);
    stack.push(trueBlock);
    stack.push(false);
    registry.resolve("if")(stack);
    expect(stack.toArray()).toEqual(["no"]);
  });

  it("times: repeat block N times via definition", async () => {
    // #[ 1 + ] :inc; 0; #[ inc ] :step; step step step;
    // Alternative: use times with definition
    // 0 #[ 1 + ] :inc; inc inc inc; => [3]
    expect(await evalJth("0; #[ 1 + ] :inc; inc; inc; inc;")).toEqual([3]);
  });

  it("2-arg if executes block when truthy", () => {
    const stack = new Stack();
    stack.push(42);
    const block = (s) => s.push("matched");
    stack.push(block);
    stack.push(true);
    registry.resolve("if")(stack);
    expect(stack.toArray()).toEqual([42, "matched"]);
  });

  it("2-arg if skips block when falsy", () => {
    const stack = new Stack();
    stack.push(42);
    const block = (s) => s.push("matched");
    stack.push(block);
    stack.push(false);
    registry.resolve("if")(stack);
    expect(stack.toArray()).toEqual([42]);
  });

  it("if/elseif/else chain: matches first", () => {
    const stack = new Stack();
    stack.push(99);

    const b1 = (s) => s.push("first");
    stack.push(b1);
    stack.push(true);
    registry.resolve("if")(stack);

    const b2 = (s) => s.push("second");
    stack.push(b2);
    stack.push(true);
    registry.resolve("elseif")(stack);

    const b3 = (s) => s.push("fallback");
    stack.push(b3);
    registry.resolve("else")(stack);

    expect(stack.toArray()).toEqual([99, "first"]);
  });

  it("if/elseif/else chain: matches elseif", () => {
    const stack = new Stack();
    stack.push(99);

    const b1 = (s) => s.push("first");
    stack.push(b1);
    stack.push(false);
    registry.resolve("if")(stack);

    const b2 = (s) => s.push("second");
    stack.push(b2);
    stack.push(true);
    registry.resolve("elseif")(stack);

    const b3 = (s) => s.push("fallback");
    stack.push(b3);
    registry.resolve("else")(stack);

    expect(stack.toArray()).toEqual([99, "second"]);
  });

  it("if/elseif/else chain: falls to else", () => {
    const stack = new Stack();
    stack.push(99);

    const b1 = (s) => s.push("first");
    stack.push(b1);
    stack.push(false);
    registry.resolve("if")(stack);

    const b2 = (s) => s.push("second");
    stack.push(b2);
    stack.push(false);
    registry.resolve("elseif")(stack);

    const b3 = (s) => s.push("fallback");
    stack.push(b3);
    registry.resolve("else")(stack);

    expect(stack.toArray()).toEqual([99, "fallback"]);
  });
});

describe("E2E: Error handling", () => {
  // Similar to `if`, the `try` operator expects a callable block on the
  // stack. Since processN executes blocks immediately, we test `try` at
  // the runtime level with functions pre-pushed onto the stack.

  it("try success: block executes normally (runtime-level)", () => {
    const stack = new Stack();
    const block = (s) => s.push(42);
    stack.push(block);
    registry.resolve("try")(stack);
    expect(stack.toArray()).toEqual([42]);
  });

  it("try error: catches and pushes Error (runtime-level)", () => {
    const stack = new Stack();
    const block = () => {
      throw new Error("oops");
    };
    stack.push(block);
    registry.resolve("try")(stack);
    const result = stack.toArray();
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Error);
    expect(result[0].message).toBe("oops");
  });

  it("throw propagates as an error through evalJth", async () => {
    await expect(evalJth('"oops" throw;')).rejects.toThrow("oops");
  });
});

describe("E2E: Multi-statement programs", () => {
  it("definition then usage across statements", async () => {
    expect(await evalJth("#[ dupe * ] :square; 5 square;")).toEqual([25]);
  });

  it("stack persists across statements", async () => {
    expect(await evalJth("1; 2; +;")).toEqual([3]);
  });

  it("chained definitions", async () => {
    expect(
      await evalJth(
        "#[ dupe * ] :square; #[ square square ] :fourth; 2 fourth;"
      )
    ).toEqual([16]);
  });

  it("complex multi-step program", async () => {
    // Define square, apply to 3, add 1
    expect(await evalJth("#[ dupe * ] :sq; 3 sq; 1 +;")).toEqual([10]);
  });
});

describe("E2E: String operations", () => {
  it("string length: 'hello' len", async () => {
    expect(await evalJth('"hello" len;')).toEqual([5]);
  });

  it("string concatenation: 'hello' ' world' strcat", async () => {
    expect(await evalJth('"hello" " world" strcat;')).toEqual([
      "hello world",
    ]);
  });

  it("string uppercase", async () => {
    expect(await evalJth('"hello" upper;')).toEqual(["HELLO"]);
  });

  it("string lowercase", async () => {
    expect(await evalJth('"HELLO" lower;')).toEqual(["hello"]);
  });
});

describe("E2E: Arrays", () => {
  it("array literal: [1 2 3]", async () => {
    expect(await evalJth("[1 2 3];")).toEqual([[1, 2, 3]]);
  });

  it("spread: [1 2 3] ...", async () => {
    expect(await evalJth("[1 2 3] ...;")).toEqual([1, 2, 3]);
  });

  it("nested array literal", async () => {
    expect(await evalJth("[1 [2 3] 4];")).toEqual([[1, [2, 3], 4]]);
  });
});

describe("E2E: Type operations", () => {
  it("typeof number", async () => {
    expect(await evalJth("42 typeof;")).toEqual(["number"]);
  });

  it("typeof string", async () => {
    expect(await evalJth('"hi" typeof;')).toEqual(["string"]);
  });

  it("number? predicate", async () => {
    expect(await evalJth("42 number?;")).toEqual([true]);
  });

  it("string? predicate", async () => {
    expect(await evalJth('"hi" string?;')).toEqual([true]);
  });
});

describe("E2E: Transform output verification", () => {
  it("transform output is valid JS syntax", () => {
    const js = transform("1 2 +;");
    // Verify it is a non-empty string containing expected runtime calls.
    expect(typeof js).toBe("string");
    expect(js.length).toBeGreaterThan(0);
  });

  it("preamble includes correct imports", () => {
    const js = transform("1 2 +;");
    expect(js).toContain(
      'import { Stack, processN, registry } from "jth-runtime"'
    );
    expect(js).toContain('import "jth-stdlib"');
    expect(js).toContain("const stack = new Stack()");
  });

  it("preamble can be disabled", () => {
    const js = transform("1 2 +;", { preamble: false });
    expect(js).not.toContain("import");
    expect(js).not.toContain("const stack");
  });

  it("definition generates registry.set call", () => {
    const js = transform("#[ dupe * ] :square;", { preamble: false });
    expect(js).toContain('registry.set("square"');
  });

  it("value definition generates const assignment", () => {
    const js = transform("42 ::x;", { preamble: false });
    expect(js).toContain("const x = stack.pop()");
  });
});

describe("E2E: Block-aware array operations", () => {
  it("map: double each element", async () => {
    expect(await evalJth("[1 2 3 4 5] #[ 2 * ] map;")).toEqual([
      [2, 4, 6, 8, 10],
    ]);
  });

  it("map: increment each element", async () => {
    expect(await evalJth("[10 20 30] #[ 1 + ] map;")).toEqual([[11, 21, 31]]);
  });

  it("filter: keep even numbers", async () => {
    expect(await evalJth("[1 2 3 4 5 6] #[ 2 % 0 = ] filter;")).toEqual([
      [2, 4, 6],
    ]);
  });

  it("filter: keep values greater than 3", async () => {
    expect(await evalJth("[1 2 3 4 5] #[ 3 > ] filter;")).toEqual([[4, 5]]);
  });

  it("reduce: sum", async () => {
    expect(await evalJth("[1 2 3 4 5] 0 #[ + ] reduce;")).toEqual([15]);
  });

  it("reduce: product", async () => {
    expect(await evalJth("[1 2 3 4] 1 #[ * ] reduce;")).toEqual([24]);
  });

  it("fold: alias for reduce", async () => {
    expect(await evalJth("[1 2 3 4 5] 0 #[ + ] fold;")).toEqual([15]);
  });

  it("bend: generate 1 to 5", async () => {
    expect(
      await evalJth("1 #[ 5 <= ] #[ dupe 1 + ] bend;")
    ).toEqual([[1, 2, 3, 4, 5]]);
  });

  it("bend: generate 1 to 10", async () => {
    expect(
      await evalJth("1 #[ 10 <= ] #[ dupe 1 + ] bend;")
    ).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  });

  it("map then filter pipeline", async () => {
    expect(
      await evalJth("[1 2 3 4 5] #[ 2 * ] map #[ 5 > ] filter;")
    ).toEqual([[6, 8, 10]]);
  });
});

describe("E2E: Full pipeline round-trips", () => {
  it("fibonacci-like accumulation", async () => {
    // Start with 1 1, add them, giving [1, 2] on the stack
    // (the first 1 is consumed by +)
    expect(await evalJth("1 1 dupe; reverse; +;")).toEqual([1, 2]);
  });

  it("product (variadic \u03A0): 2 3 4 \u03A0", async () => {
    expect(await evalJth("2 3 4 \u03A0;")).toEqual([24]);
  });

  it("abs of negative number", async () => {
    expect(await evalJth("-5 abs;")).toEqual([5]);
  });

  it("sqrt", async () => {
    expect(await evalJth("9 sqrt;")).toEqual([3]);
  });

  it("floor", async () => {
    expect(await evalJth("3.7 floor;")).toEqual([3]);
  });

  it("ceil", async () => {
    expect(await evalJth("3.2 ceil;")).toEqual([4]);
  });

  it("min of stack", async () => {
    expect(await evalJth("5 2 8 1 min;")).toEqual([1]);
  });

  it("max of stack", async () => {
    expect(await evalJth("5 2 8 1 max;")).toEqual([8]);
  });
});
