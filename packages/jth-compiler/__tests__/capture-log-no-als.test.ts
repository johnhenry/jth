import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const fx = (f: string) => fileURLToPath(new URL(`./fixtures/${f}`, import.meta.url));

describe("captureLog without a working AsyncLocalStorage (browser/Worker, #68)", () => {
  it("captures output written after an await when ALS is shimmed", () => {
    const out = execFileSync(
      process.execPath,
      ["--import", fx("lossy-als-register.mjs"), fx("capture-after-await.mjs")],
      { encoding: "utf8", cwd: fileURLToPath(new URL("..", import.meta.url)) }
    );
    const { a, b } = JSON.parse(out.trim().split("\n").pop()!);
    expect(a).toBe("A1\nA2\nA3");
    expect(b).toBe("B1\n7\n8\nB2");
  });
});
