/**
 * Self-contained bundling of compiled jth programs.
 *
 * `jth compile` / `jth run` emit JavaScript whose preamble imports
 * "@johnhenry/jth-runtime" and "@johnhenry/jth-stdlib" (and possibly opt-in op packages like
 * "@johnhenry/jth-html"). Those bare specifiers only resolve where the packages are
 * installed. To make compiled output portable — `node out.mjs` from any
 * directory — we bundle it with esbuild, inlining the jth packages.
 *
 * Resolution model: @johnhenry/jth-* specifiers are resolved from THIS
 * package's own installation (the CLI declares @johnhenry/jth-runtime,
 * @johnhenry/jth-stdlib, etc. as real dependencies), so a globally installed
 * @johnhenry/jth always finds its own copies. Anything else (relative
 * imports like "./lib.mjs", other npm packages) resolves relative to the
 * source file's directory.
 */

import { build } from "esbuild";
import type { Plugin } from "esbuild";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

/**
 * Resolve a jth package specifier from the CLI's own installation.
 * Returns a filesystem path, or null to fall back to default resolution
 * (which esbuild performs relative to the program's resolveDir — that lets
 * user projects supply their own op packages, e.g. a locally installed
 * @johnhenry/jth-html when the CLI doesn't ship it).
 */
function resolveFromCli(specifier: string): string | null {
  try {
    // import.meta.resolve is synchronous on Node 20+.
    const url = import.meta.resolve(specifier);
    if (url.startsWith("file:")) return fileURLToPath(url);
  } catch {
    // fall through
  }
  try {
    // Fallback (also covers environments where import.meta.resolve is
    // unavailable): CommonJS resolution hits the "default" export condition.
    return createRequire(import.meta.url).resolve(specifier);
  } catch {
    return null;
  }
}

const jthResolverPlugin: Plugin = {
  name: "jth-package-resolver",
  setup(build) {
    build.onResolve({ filter: /^@johnhenry\/jth-[a-z-]+(\/.*)?$/ }, (args) => {
      const path = resolveFromCli(args.path);
      return path ? { path } : undefined;
    });
  },
};

/**
 * Bundle compiled jth program JavaScript into a single self-contained
 * ESM module string. Relative imports resolve against `resolveDir`.
 */
export async function bundleProgram(js: string, resolveDir: string): Promise<string> {
  const result = await build({
    stdin: {
      contents: js,
      resolveDir,
      sourcefile: "jth-program.mjs",
      loader: "js",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    write: false,
    logLevel: "silent",
    plugins: [jthResolverPlugin],
    banner: {
      js: "// Compiled by jth (self-contained bundle: includes jth-runtime + jth-stdlib).",
    },
  });
  return result.outputFiles[0].text;
}
