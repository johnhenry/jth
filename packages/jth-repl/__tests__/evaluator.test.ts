import { describe, it, expect, vi } from "vitest";
import { createEvaluator } from "../src/evaluator.ts";

describe("createEvaluator", () => {
  // ── Basic arithmetic ───────────────────────────────────────────

  it("evaluates simple addition: 1 2 +;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 +;");
    expect(ev.toArray()).toEqual([3]);
  });

  it("evaluates multiple values in one statement: 1 2 3 +;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3 +;");
    expect(ev.toArray()).toEqual([1, 5]);
  });

  it("evaluates subtraction: 10 3 -;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("10 3 -;");
    expect(ev.toArray()).toEqual([7]);
  });

  it("evaluates multiplication: 6 7 *;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("6 7 *;");
    expect(ev.toArray()).toEqual([42]);
  });

  // ── Stack persistence across calls ─────────────────────────────

  it("stack persists across evaluate calls", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1;");
    await ev.evaluate("2;");
    await ev.evaluate("+;");
    expect(ev.toArray()).toEqual([3]);
  });

  it("stack accumulates values across calls", async () => {
    const ev = createEvaluator();
    await ev.evaluate("10;");
    await ev.evaluate("20;");
    await ev.evaluate("30;");
    expect(ev.toArray()).toEqual([10, 20, 30]);
  });

  // ── Definitions via :name ──────────────────────────────────────

  it("defines and invokes a block: #[ dupe * ] :square; 5 square;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("#[ dupe * ] :square; 5 square;");
    expect(ev.toArray()).toEqual([25]);
  });

  it("definition persists across evaluate calls", async () => {
    const ev = createEvaluator();
    await ev.evaluate("#[ 1 + ] :inc;");
    await ev.evaluate("3 inc;");
    expect(ev.toArray()).toEqual([4]);
  });

  // ── Boolean and logic operations ───────────────────────────────

  it("evaluates boolean AND: true false &&;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("true false &&;");
    expect(ev.toArray()).toEqual([false]);
  });

  it("evaluates boolean OR: true false ||;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("true false ||;");
    expect(ev.toArray()).toEqual([true]);
  });

  // ── Comparison operations ──────────────────────────────────────

  it("evaluates greater-than: 5 3 >;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("5 3 >;");
    expect(ev.toArray()).toEqual([true]);
  });

  it("evaluates less-than: 2 7 <;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("2 7 <;");
    expect(ev.toArray()).toEqual([true]);
  });

  it("evaluates equality: 5 5 =;", async () => {
    const ev = createEvaluator();
    await ev.evaluate("5 5 =;");
    expect(ev.toArray()).toEqual([true]);
  });

  // ── peek, toArray, length, clear ───────────────────────────────

  it("peek returns the top item", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3;");
    expect(ev.peek()).toBe(3);
  });

  it("length returns item count", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3;");
    expect(ev.length).toBe(3);
  });

  it("toArray returns all items in order", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3;");
    expect(ev.toArray()).toEqual([1, 2, 3]);
  });

  it("clear empties the stack", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3;");
    ev.clear();
    expect(ev.toArray()).toEqual([]);
    expect(ev.length).toBe(0);
  });

  // ── getStack returns the underlying Stack instance ─────────────

  it("getStack returns the Stack object", async () => {
    const ev = createEvaluator();
    await ev.evaluate("42;");
    const s = ev.getStack();
    expect(s.peek()).toBe(42);
    expect(s.toArray()).toEqual([42]);
  });

  // ── String operations ──────────────────────────────────────────

  it("evaluates string concatenation: two strings with +", async () => {
    const ev = createEvaluator();
    await ev.evaluate('"hello" " world" +;');
    expect(ev.toArray()).toEqual(["hello world"]);
  });

  // ── peek operator logs without consuming ───────────────────

  it("peek operator logs top item without consuming it", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const ev = createEvaluator();
    await ev.evaluate("42 peek;");
    expect(spy).toHaveBeenCalledWith(42);
    // Stack should still contain 42 since peek only peeks
    expect(ev.toArray()).toEqual([42]);
    spy.mockRestore();
  });

  // ── Error handling ─────────────────────────────────────────────

  it("throws on invalid syntax", async () => {
    const ev = createEvaluator();
    await expect(ev.evaluate("#[#[#[#[;")).rejects.toThrow();
  });

  it("throws on unknown operator", async () => {
    const ev = createEvaluator();
    await expect(ev.evaluate("1 2 nonexistent_op_xyz;")).rejects.toThrow();
  });

  // ── Multiple statements in one call ────────────────────────────

  it("handles multiple semicolons in one evaluate call", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1; 2; 3;");
    expect(ev.toArray()).toEqual([1, 2, 3]);
  });

  // ── Stack manipulation ─────────────────────────────────────────

  it("dupe duplicates the top item", async () => {
    const ev = createEvaluator();
    await ev.evaluate("5 dupe;");
    expect(ev.toArray()).toEqual([5, 5]);
  });

  it("swap exchanges the top two items", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 swap;");
    expect(ev.toArray()).toEqual([2, 1]);
  });

  it("drop removes the top item", async () => {
    const ev = createEvaluator();
    await ev.evaluate("1 2 3 drop;");
    expect(ev.toArray()).toEqual([1, 2]);
  });

  // ── Registry isolation between independent evaluators (issue #48) ──
  // createEvaluator() previously fell back to jth-compiler's shared
  // module-level registry when no `registry` option was passed to run(),
  // so two independently-created evaluators in the same process saw each
  // other's `:name` definitions.
  describe("registry isolation between evaluators", () => {
    it("a :name definition in one evaluator is not visible in another", async () => {
      const a = createEvaluator();
      const b = createEvaluator();

      await a.evaluate("#[ 1 ] :eval-isolation-unique-xyz;");
      await expect(b.evaluate("eval-isolation-unique-xyz;")).rejects.toThrow();
    });

    it("each evaluator still sees its own definitions across calls", async () => {
      const a = createEvaluator();
      const b = createEvaluator();

      await a.evaluate("#[ 1 + ] :inc;");
      await b.evaluate("#[ 2 * ] :inc;");

      await a.evaluate("3 inc;");
      await b.evaluate("3 inc;");

      expect(a.toArray()).toEqual([4]);
      expect(b.toArray()).toEqual([6]);
    });

    it("both evaluators still resolve shared stdlib operators normally", async () => {
      const a = createEvaluator();
      const b = createEvaluator();
      await a.evaluate("1 2 +;");
      await b.evaluate("10 3 -;");
      expect(a.toArray()).toEqual([3]);
      expect(b.toArray()).toEqual([7]);
    });
  });

  // ── Sandboxed evaluator opt-in (issue #47) ──
  // By default (sandbox: false, unset), createEvaluator() is unsandboxed —
  // this matches jth run -c / the interactive REPL's existing behavior and
  // is NOT a breaking change. Passing a sandbox option routes evaluate()
  // through jth-eval's JthContext instead.
  describe("sandboxed evaluator (opt-in)", () => {
    it("default (no sandbox option) still allows inline JS -- unchanged behavior", async () => {
      const ev = createEvaluator();
      await ev.evaluate("((s) => { s.push(99); });");
      expect(ev.toArray()).toEqual([99]);
    });

    it("sandbox: true rejects inline JS at compile time", async () => {
      const ev = createEvaluator({ sandbox: true });
      await expect(ev.evaluate("((s) => { s.push(99); });")).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
    });

    it("sandbox: true rejects ::name value-definitions", async () => {
      const ev = createEvaluator({ sandbox: true });
      await expect(ev.evaluate("42 ::x;")).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
    });

    it("sandbox: true blocks stdlib operators (bare mode)", async () => {
      const ev = createEvaluator({ sandbox: true });
      await expect(ev.evaluate("1 2 +;")).rejects.toThrow();
    });

    it('sandbox: "restricted" allows pure stdlib but blocks I/O ops like peek', async () => {
      const ev = createEvaluator({ sandbox: "restricted" });
      await ev.evaluate("1 2 +;");
      expect(ev.toArray()).toEqual([3]);
      await expect(ev.evaluate("peek;")).rejects.toMatchObject({
        code: "OP_NOT_ALLOWED",
      });
    });

    it("sandboxed evaluator maintains stack state across evaluate() calls", async () => {
      const ev = createEvaluator({ sandbox: "restricted" });
      await ev.evaluate("1;");
      await ev.evaluate("2;");
      await ev.evaluate("+;");
      expect(ev.toArray()).toEqual([3]);
    });

    it("sandboxed evaluator supports peek()/length/clear()", async () => {
      const ev = createEvaluator({ sandbox: "restricted" });
      await ev.evaluate("1 2 3;");
      expect(ev.peek()).toBe(3);
      expect(ev.length).toBe(3);
      ev.clear();
      expect(ev.toArray()).toEqual([]);
      expect(ev.length).toBe(0);
    });
  });
});
