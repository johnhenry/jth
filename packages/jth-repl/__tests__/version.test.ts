import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getVersion } from "../src/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("REPL version", () => {
  it("matches jth-repl's package.json version", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, "..", "package.json"), "utf-8")
    );
    expect(getVersion()).toBe(pkg.version);
  });

  it("is a semver-ish string, not a hardcoded brand version", () => {
    expect(getVersion()).toMatch(/^\d+\.\d+\.\d+/);
    expect(getVersion()).not.toBe("2.0");
  });
});
