import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { registry, getMeta } from "@johnhenry/jth-runtime";
import { stdlibOpNames, OP_DOCS, operatorReferenceMarkdown } from "../src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("operator registry documentation (issue #54)", () => {
  it("every registered static op has a non-empty description", () => {
    const missing = registry.names().filter((n) => !registry.info(n)?.description?.trim());
    expect(missing).toEqual([]);
  });

  it("every registered static op has a valid arity", () => {
    for (const info of registry.infos()) {
      const ok = typeof info.arity === "number" || info.arity === "variadic" || info.arity === "varies";
      expect(ok, `${info.name}: ${String(info.arity)}`).toBe(true);
    }
  });

  it("OP_DOCS has no stale entries for ops that are not registered", () => {
    const stale = Object.keys(OP_DOCS).filter((n) => !stdlibOpNames().includes(n));
    expect(stale).toEqual([]);
  });

  it("every dynamic pattern family has documentation", () => {
    expect(registry.dynamicInfos().length).toBeGreaterThanOrEqual(registry.dynamicPatterns().length);
  });

  it("getMeta() of a stdlib operator returns its description and arity", () => {
    expect(getMeta(registry.get("swap")!)).toMatchObject({ description: expect.stringMatching(/swap/i), arity: 2 });
    expect(getMeta(registry.get("map")!).description).toMatch(/block/i);
    // timing annotations are untouched
    expect(getMeta(registry.get("<<-")!)).toMatchObject({ rewind: -1 });
  });

  it("registered documentation is what the stack machine still sees as timing-free", () => {
    const m = getMeta(registry.get("+")!);
    expect(m.delay).toBeUndefined();
    expect(m.skip).toBeUndefined();
  });

  it("docs/operators.md is up to date with the registry (run `npm run docs:ops`)", () => {
    const file = resolve(__dirname, "..", "..", "..", "docs", "operators.md");
    expect(readFileSync(file, "utf-8")).toBe(operatorReferenceMarkdown());
  });
});
