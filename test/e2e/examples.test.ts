/**
 * End-to-end tests that run shipped example programs through the REAL CLI
 * (spawned process), proving the opt-in op-package load path works:
 * examples/11-html.jth declares `::import "@johnhenry/jth-html";`, which the compiler
 * passes through so jth-html side-effect-registers its `h-*` ops.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");

/** Run the built jth CLI with the given args, from the repo root. */
function jth(...args: string[]) {
  const bin = resolve(repoRoot, "packages", "jth-cli", "dist", "bin", "jth.js");
  return spawnSync(process.execPath, [bin, ...args], {
    cwd: repoRoot,
    encoding: "utf-8",
    timeout: 60_000,
  });
}

describe("E2E: jth run examples/11-html.jth (opt-in jth-html import)", () => {
  it("renders the expected HTML with no manual setup", () => {
    const result = jth("run", "examples/11-html.jth");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(
      "<html>" +
        "<head>" +
        '<meta charset="utf-8">' +
        "<title>My Page</title>" +
        "</head>" +
        "<body>" +
        "<h1>Hello, World!</h1>" +
        "<main>" +
        "<p>Welcome to jth-html.</p>" +
        "<ul><li>Item 1</li><li>Item 2</li></ul>" +
        "</main>" +
        "</body>" +
        "</html>"
    );
  });
});

describe("E2E: jth run examples/01-hello.jth", () => {
  it("prints the greeting", () => {
    const result = jth("run", "examples/01-hello.jth");
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("Hello, World!");
  });
});
