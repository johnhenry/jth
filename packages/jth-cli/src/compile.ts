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
import { resolve, dirname, basename, extname, relative, sep } from "node:path";
import { transform } from "@johnhenry/jth-compiler";
import { bundleProgram } from "./bundle.ts";

interface CompileOptions {
  isCode?: boolean;
  output?: string | null;
}

/**
 * Build a resolveImportPath hook (see GenerateOptions in jth-compiler) that
 * re-expresses a ::import's relative specifier — originally resolved
 * against `inputDir` — as a path relative to `outputDir` instead. Needed
 * because the bare (--no-bundle) compile path writes generated JS
 * verbatim: unlike compileBundled (which resolves relative imports at
 * bundle time via esbuild's resolveDir), the emitted `import "./x.mjs"`
 * specifier is resolved by Node relative to wherever the *output* file
 * ends up, which is only the same as `inputDir` when input and output
 * share a directory.
 */
function rewriteRelativeImportPath(inputDir: string, outputDir: string) {
  return (relPath: string): string => {
    const absoluteTarget = resolve(inputDir, relPath);
    let rewritten = relative(outputDir, absoluteTarget);
    // ESM import specifiers always use forward slashes, even on Windows.
    rewritten = rewritten.split(sep).join("/");
    if (!rewritten.startsWith(".")) rewritten = "./" + rewritten;
    return rewritten;
  };
}

/**
 * Compile jth source code to JavaScript (bare-specifier form, synchronous).
 */
export function compile(input: string, { isCode = false, output = null }: CompileOptions = {}): string {
  // 1. Obtain source
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");

  // 2. Transform to JavaScript (with preamble). If the output will land in
  // a different directory than the input, rewrite ::import's relative
  // specifiers to still resolve correctly from the output's location —
  // otherwise Node would silently resolve them against the wrong
  // directory (see jth/issues/45).
  const inputDir = isCode ? process.cwd() : dirname(resolve(input));
  const outputDir = output ? dirname(resolve(output)) : inputDir;
  const resolveImportPath =
    outputDir !== inputDir ? rewriteRelativeImportPath(inputDir, outputDir) : undefined;
  const js = transform(source, { preamble: true, resolveImportPath });

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
