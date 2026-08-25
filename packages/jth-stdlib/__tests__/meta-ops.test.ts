import { describe, it, expect } from "vitest";
import { Stack, processN } from "@johnhenry/jth-runtime";
import { execute, executeSpread } from "../src/meta-ops.ts";
import { run } from "@johnhenry/jth-compiler";
import "../src/index.ts";

describe("meta-ops: execute ($)", () => {
  it("pops and executes a function with the stack", () => {
    const s = new Stack();
    s.push(1, 2);
    s.push((stack: Stack) => {
      const b = stack.pop() as number;
      const a = stack.pop() as number;
      stack.push(a + b);
    });
    execute(s);
    expect(s.toArray()).toEqual([3]);
  });

  it("returns the promise of an async block so callers can await", async () => {
    const s = new Stack();
    s.push(async (stack: Stack) => {
      await new Promise((r) => setTimeout(r, 5));
      stack.push("done");
    });
    const result = execute(s);
    expect(typeof (result as Promise<void>).then).toBe("function");
    await result;
    expect(s.toArray()).toEqual(["done"]);
  });

  it("silently drops a non-function top value", () => {
    const s = new Stack();
    s.push(1, 42);
    execute(s);
    expect(s.toArray()).toEqual([1]);
  });
});

describe("meta-ops: executeSpread ($$)", () => {
  it("pops an array and processes its items against the stack", async () => {
    const s = new Stack();
    s.push([1, 2, (stack: Stack) => {
      const b = stack.pop() as number;
      const a = stack.pop() as number;
      stack.push(a * b);
    }]);
    await executeSpread(s);
    expect(s.toArray()).toEqual([2]);
  });

  it("does nothing when top is not an array", () => {
    const s = new Stack();
    s.push(1, "not-array");
    executeSpread(s);
    expect(s.toArray()).toEqual([1]);
  });
});

describe("meta-ops: registered ops via jth programs", () => {
  it("$ executes a block from the stack", async () => {
    const { value } = await run("1 2 #[ + ] $;");
    expect(value).toBe(3);
  });

  it("$$ executes an array as a program", async () => {
    const s = new Stack();
    // build [3 4 +] as data, then execute it
    const { registry } = await import("@johnhenry/jth-runtime");
    s.push([3, 4, registry.resolve("+")]);
    await processN(s, [registry.resolve("$$")]);
    expect(s.toArray()).toEqual([7]);
  });

  it("->> (skip -1) pushes the rest of the statement as values", async () => {
    // Without ->>, `+` would execute; after ->>, it lands on the stack
    // as a bare function value instead.
    const { stack } = await run("1 2 ->> +;");
    const arr = stack.toArray();
    expect(arr.slice(0, 2)).toEqual([1, 2]);
    expect(typeof arr[2]).toBe("function");
    expect(arr).toHaveLength(3);
  });

  it("<<- (rewind -1) re-queues stack items for processing", async () => {
    // The block lands on the stack as a value; <<- rewinds the whole
    // stack back into the queue, so the block is executed this time.
    const { value, stack } = await run("1 2 #[ + ] <<-;");
    expect(stack.toArray()).toEqual([3]);
    expect(value).toBe(3);
  });
});
