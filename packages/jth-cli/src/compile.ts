/**
 * Compile command: transform jth source to JavaScript.
 *
 * Two output forms:
 *   - Bundled (default for `jth compile <file>`): a self-contained ESM
 *     module with jth-runtime/jth-stdlib inlined — `node out.mjs` works
 *     from any directory with no packages installed.
 *   - Bare (--no-bundle, and the default of the `compile()` API / inline
 *     `-c` output): the raw transform result, importing "@johnhenry/jth-runtime" and
 *     "@johnhenry/jth-stdlib" as bare specifiers — for users who have the jth
 *     packages installed in their project.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import { transform } from "@johnhenry/jth-compiler";
import { bundleProgram } from "./bundle.ts";

interface CompileOptions {
  isCode?: boolean;
  output?: string | null;
}

/**
 * Compile jth source code to JavaScript (bare-specifier form, synchronous).
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
 * Compile jth source code to a self-contained JavaScript bundle
 * (jth-runtime + jth-stdlib inlined; relative imports resolved against
 * the source file's directory).
 */
export async function compileBundled(
  input: string,
  { isCode = false, output = null }: CompileOptions = {}
): Promise<string> {
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");
  const js = transform(source, { preamble: true });
  const resolveDir = isCode ? process.cwd() : dirname(resolve(input));
  const bundled = await bundleProgram(js, resolveDir);

  if (output) {
    writeFileSync(resolve(output), bundled, "utf-8");
  }
  return bundled;
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
