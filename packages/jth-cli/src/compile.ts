/**
 * Compile command: transform jth source to JavaScript.
 *
 * Reads source from a file path or inline string, runs the jth-compiler
 * transform pipeline, and either writes the result to a file or returns it.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import { transform } from "jth-compiler";

interface CompileOptions {
  isCode?: boolean;
  output?: string | null;
}

/**
 * Compile jth source code to JavaScript.
 */
export function compile(input: string, { isCode = false, output = null }: CompileOptions = {}): string {
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
 */
export function deriveOutputPath(inputPath: string): string {
  const dir = dirname(inputPath);
  const ext = extname(inputPath);
  const base = basename(inputPath, ext);
  return resolve(dir, `${base}.mjs`);
}
