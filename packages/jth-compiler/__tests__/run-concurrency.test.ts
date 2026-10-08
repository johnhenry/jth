import { describe, it, expect, vi, afterEach } from "vitest";
import { run } from "../src/run.ts";
import "@johnhenry/jth-stdlib";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("run({ captureLog }) is isolated per evaluation (audit #28 item 3)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("two concurrent captured runs do not cross-contaminate output", async () => {
    // `_` waits for a duration (ms) so the runs genuinely interleave.
    const [a, b] = await Promise.all([
      run('"A1" peek; 30 _ "A2" peek;', { captureLog: true }),
      run('"B1" peek; 5 _ "B2" peek;', { captureLog: true }),
    ]);
    expect(a.output).toBe("A1\nA2");
    expect(b.output).toBe("B1\nB2");
  });

  it("unrelated host console.log between concurrent runs reaches the real console, not a run's buffer", async () => {
    const real = vi.spyOn(console, "log").mockImplementation(() => {});
    const pa = run('"A" peek; 40 _ "A2" peek;', { captureLog: true });
    const pb = run('"B" peek; 5 _;', { captureLog: true });
    await pb; // B finishes first, A still running
    console.log("SIDE-EFFECT-LOG-FROM-HOST");
    const a = await pa;
    expect(a.output).toBe("A\nA2");
    expect(a.output).not.toContain("SIDE-EFFECT");
    expect(real).toHaveBeenCalledWith("SIDE-EFFECT-LOG-FROM-HOST");
  });

  it("console.log is not replaced while or after a captured run", async () => {
    const before = console.log;
    const p = run('"x" peek; 10 _;', { captureLog: true });
    expect(console.log).toBe(before);
    await p;
    expect(console.log).toBe(before);
  });

  it("a captured run that throws leaves no capture state behind", async () => {
    await expect(run('"x" peek; nope-op;', { captureLog: true })).rejects.toThrow();
    const real = vi.spyOn(console, "log").mockImplementation(() => {});
    await run('"visible" peek;');
    expect(real).toHaveBeenCalledWith("visible");
  });

  it("uncaptured runs still write to the real console", async () => {
    const real = vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await run('"hi" peek;');
    expect(r.output).toBe("");
    expect(real).toHaveBeenCalledWith("hi");
  });

  it("peek-all captures all stack items on one line", async () => {
    const r = await run("1 2 3 peek-all;", { captureLog: true });
    expect(r.output).toBe("1 2 3");
  });
});
