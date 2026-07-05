import { describe, it, expect } from "vitest";
import { Stack, op, processN } from "jth-runtime";
import { wait, waitAll } from "../src/async-ops.ts";
import { run } from "jth-compiler";
import "../src/index.ts";

describe("async-ops: wait (_)", () => {
  it("awaits a promise on top of the stack", async () => {
    const s = new Stack();
    s.push(Promise.resolve(42));
    await wait(s);
    expect(s.toArray()).toEqual([42]);
  });

  it("passes non-promise values through unchanged", () => {
    const s = new Stack();
    s.push(7);
    const result = wait(s);
    expect(result).toBeUndefined(); // stays synchronous
    expect(s.toArray()).toEqual([7]);
  });

  it("only awaits the top item", async () => {
    const s = new Stack();
    s.push(Promise.resolve("bottom"), Promise.resolve("top"));
    await wait(s);
    const arr = s.toArray();
    expect(arr[1]).toBe("top");
    expect(typeof (arr[0] as Promise<string>).then).toBe("function");
  });

  it("returns a thenable for promises (processN can promote)", () => {
    const s = new Stack();
    s.push(Promise.resolve(1));
    const result = wait(s);
    expect(typeof (result as Promise<void>).then).toBe("function");
  });
});

describe("async-ops: waitAll (__)", () => {
  it("awaits every promise on the stack, preserving order", async () => {
    const s = new Stack();
    s.push(Promise.resolve(1), 2, Promise.resolve(3));
    await waitAll(s);
    expect(s.toArray()).toEqual([1, 2, 3]);
  });

  it("works on an empty stack", async () => {
    const s = new Stack();
    await waitAll(s);
    expect(s.toArray()).toEqual([]);
  });

  it("rejects if any promise rejects", async () => {
    const s = new Stack();
    s.push(Promise.resolve(1), Promise.reject(new Error("boom")));
    await expect(waitAll(s)).rejects.toThrow("boom");
  });
});

describe("async-ops: registered ops via processN / programs", () => {
  it("_ resolves an async op result inside a program", async () => {
    const s = new Stack();
    const delayed = op(0)(async () => {
      await new Promise((r) => setTimeout(r, 5));
      return [Promise.resolve(99)];
    });
    await processN(s, [delayed, wait]);
    expect(s.toArray()).toEqual([99]);
  });

  it("__ resolves all promises via a jth program", async () => {
    const { run: runJth } = await import("jth-compiler");
    // no promises on the stack: __ is a no-op passthrough
    const { stack } = await runJth("1 2 3 __;");
    expect(stack.toArray()).toEqual([1, 2, 3]);
  });

  it("_ passes plain values through in a jth program", async () => {
    const { stack } = await run("5 _;");
    expect(stack.toArray()).toEqual([5]);
  });
});
