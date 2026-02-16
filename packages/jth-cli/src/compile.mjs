/**
 * Compile command: transform jth source to JavaScript.
 *
 * Reads source from a file path or inline string, runs the jth-compiler
 * transform pipeline, and either writes the result to a file or returns it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import { transform } from "jth-compiler";

/**
 * Compile jth source code to JavaScript.
 *
 * @param {string} input  - file path or inline source code
 * @param {object} [opts]
 * @param {boolean} [opts.isCode=false] - treat input as inline source code
 * @param {string|null} [opts.output=null] - output file path (null = return string)
 * @returns {string} compiled JavaScript source (when output is null)
 */
export function compile(input, { isCode = false, output = null } = {}) {
  // 1. Obtain source
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");

  // 2. Transform to JavaScript (with preamble)
  const js = transform(source, { preamble: true });

  // 3. Write to file or return
  if (output) {
    writeFileSync(resolve(output), js, "utf-8");
    return js;
  }

  return js;
}

/**
 * Derive a default .mjs output path from a .jth input path.
 *
 * @param {string} inputPath - source file path
 * @returns {string} output path with .mjs extension
 */
export function deriveOutputPath(inputPath) {
  const dir = dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return resolve(dir, `${base}.mjs`);
}
