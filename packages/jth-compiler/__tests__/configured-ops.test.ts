import { describe, it, expect } from "vitest";
import { run } from "../src/run.ts";
import "@johnhenry/jth-stdlib";

/**
 * Configured-operator syntax `name(args)` must reach real, registered ops.
 * These go through source text (lex -> parse -> codegen -> run), not the
 * exported stdlib factories (audit #28 item 5).
 */
async function stackOf(src: string): Promise<unknown[]> {
  return (await run(src)).stack.toArray();
}

describe("configured stack ops resolve from jth source", () => {
  it("keepN(2) keeps only the bottom 2 items", async () => {
    expect(await stackOf("1 2 3 keepN(2);")).toEqual([1, 2]);
  });

  it("retrieve(0) keeps only the top item; retrieve(1) the second from top", async () => {
    expect(await stackOf("1 2 3 retrieve(0);")).toEqual([3]);
    expect(await stackOf("1 2 3 retrieve(1);")).toEqual([2]);
  });

  it("dig(1) pulls an item to the top", async () => {
    expect(await stackOf("1 2 3 dig(1);")).toEqual([1, 3, 2]);
  });

  it("bury(1) moves the top item down", async () => {
    expect(await stackOf("1 2 3 bury(1);")).toEqual([1, 3, 2]);
  });

  it("the config argument is consumed (not left on the stack)", async () => {
    expect(await stackOf("5 6 keepN(1);")).toEqual([5]);
  });

  it("works inside blocks and with peek-all", async () => {
    const r = await run("1 2 3 keepN(2) peek-all;", { captureLog: true });
    expect(r.output).toBe("1 2");
  });

  it("still reports unknown configured operators", async () => {
    await expect(run("1 notAnOp(2);")).rejects.toMatchObject({ code: "UNKNOWN_OPERATOR" });
  });
});
