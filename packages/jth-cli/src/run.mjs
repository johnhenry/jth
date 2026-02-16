/**
 * Run command: compile jth source, write to temp file, execute with Node.
 *
 * The temp file is placed next to the source file (or cwd for inline code)
 * so that relative imports in the compiled output resolve correctly.
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { transform } from "jth-compiler";

/**
 * Compile and execute jth source code.
 *
 * @param {string} input  - file path or inline source code
 * @param {object} [opts]
 * @param {boolean} [opts.isCode=false] - treat input as inline source code
 * @returns {Promise<number>} exit code from the child process
 */
export async function run(input, { isCode = false } = {}) {
  // 1. Obtain source
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");

  // 2. Transform to JavaScript
  const js = transform(source, { preamble: true });

  // 3. Determine temp file location
  //    Place next to source for correct relative import resolution.
  const baseDir = isCode ? process.cwd() : dirname(resolve(input));
  const tmpName = `.jth-run-${randomBytes(6).toString("hex")}.mjs`;
  const tmpPath = join(baseDir, tmpName);

  // 4. Write temp file
  writeFileSync(tmpPath, js, "utf-8");

  // 5. Spawn node child process
  try {
    const code = await spawnNode(tmpPath);
    return code;
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
 * Spawn a node process to run the given file, inheriting stdio.
 *
 * @param {string} filePath - path to the JavaScript file
 * @returns {Promise<number>} exit code
 */
function spawnNode(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [filePath], {
      stdio: "inherit",
      env: { ...process.env },
    });

    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}
