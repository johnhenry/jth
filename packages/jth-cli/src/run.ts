/**
 * Run command: compile jth source, bundle it into a self-contained module,
 * write it to a temp file in the OS temp dir, and execute with plain node.
 *
 * Because the output is bundled (jth-runtime/jth-stdlib inlined, relative
 * imports resolved at bundle time against the source directory), nothing
 * is written next to the user's sources and no loader (tsx) is needed at
 * runtime.
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { transform } from "@johnhenry/jth-compiler";
import { bundleProgram } from "./bundle.ts";

interface RunOptions {
  isCode?: boolean;
}

/**
 * Compile and execute jth source code. Returns the child exit code.
 */
export async function run(input: string, { isCode = false }: RunOptions = {}): Promise<number> {
  // 1. Obtain source
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");

  // 2. Transform to JavaScript (bare-specifier preamble)
  const js = transform(source, { preamble: true });

  // 3. Bundle: inline jth packages; resolve the program's own relative
  //    imports against the source file's directory (cwd for inline code).
  const resolveDir = isCode ? process.cwd() : dirname(resolve(input));
  const bundled = await bundleProgram(js, resolveDir);

  // 4. Write self-contained temp file (OS temp dir — never next to sources)
  const tmpPath = join(tmpdir(), `jth-run-${randomBytes(6).toString("hex")}.mjs`);
  writeFileSync(tmpPath, bundled, "utf-8");

  // 5. Execute with plain node
  try {
    return await spawnNode(tmpPath);
  } finally {
    // 6. Clean up temp file
    try {
      unlinkSync(tmpPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Spawn a plain node process to run the given file, inheriting stdio.
 */
function spawnNode(filePath: string): Promise<number> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [filePath], {
      stdio: "inherit",
      env: { ...process.env },
    });

    child.on("error", reject);
    child.on("close", (code) => resolvePromise(code ?? 1));
  });
}
