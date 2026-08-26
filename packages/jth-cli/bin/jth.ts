#!/usr/bin/env node

/**
 * jth CLI — compile and run .jth programs.
 *
 * Usage:
 *   jth run <file>              Compile and run a .jth file
 *   jth run -c '<code>'         Compile and run inline jth code
 *   jth compile <file> [output] Compile a .jth file to a self-contained .mjs
 *   jth compile --no-bundle <file> [output]
 *                               Compile without bundling (bare jth-* imports)
 *   jth compile -c '<code>'     Compile inline jth code to stdout (unbundled)
 *   jth repl                    Start interactive REPL
 *   jth --version | -v          Print version
 *   jth --help | -h             Print help
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, compileBundled, deriveOutputPath } from "../src/compile.ts";
import { run } from "../src/run.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  // In dev the bin lives at <pkg>/bin/jth.ts (package.json one level up);
  // built, it lives at <pkg>/dist/bin/jth.js (two levels up).
  for (const rel of ["..", "../.."] as const) {
    const candidate = resolve(__dirname, rel, "package.json");
    if (existsSync(candidate)) {
      const pkg = JSON.parse(readFileSync(candidate, "utf-8"));
      if (pkg.name === "@johnhenry/jth") return pkg.version;
    }
  }
  return "unknown";
}

const HELP = `
jth v${getVersion()} — stack-based language CLI

Usage:
  jth run <file>              Compile and execute a .jth file
  jth run -c '<code>'         Compile and execute inline jth code
  jth compile <file> [output] Compile a .jth file to a self-contained .mjs
                              (bundles jth-runtime + jth-stdlib; runs with
                              plain \`node output.mjs\` anywhere)
  jth compile --no-bundle <file> [output]
                              Compile without bundling: output imports
                              "@johnhenry/jth-runtime"/"@johnhenry/jth-stdlib" as bare specifiers
                              (requires those packages to be installed)
  jth compile -c '<code>'     Compile inline jth code (prints unbundled
                              output to stdout)
  jth repl                    Start interactive REPL
  jth --version, -v           Print version
  jth --help, -h              Print this help message

Examples:
  jth run hello.jth
  jth run -c '"hello" peek;'
  jth compile math.jth math.mjs && node math.mjs
  jth compile --no-bundle math.jth
  jth compile -c '1 2 +;'
`.trim();

// ── Argument parsing ────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(HELP);
  process.exit(0);
}

if (args[0] === "--version" || args[0] === "-v") {
  console.log(getVersion());
  process.exit(0);
}

const command = args[0];
const rest = args.slice(1);

switch (command) {
  case "run":
    await handleRun(rest);
    break;

  case "compile":
    await handleCompile(rest);
    break;

  case "repl":
    await handleRepl();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "jth --help" for usage information.');
    process.exit(1);
}


/**
 * Print an error, including source position (line:col) for jth errors
 * that carry one (JthError subclasses: lexer/parser/runtime errors).
 */
function reportError(err: any): void {
  if (err && err.line != null) {
    console.error(`${err.name ?? "Error"} at ${err.line}:${err.column ?? 0}: ${err.message}`);
  } else {
    console.error(`Error: ${err?.message ?? err}`);
  }
}

// ── Command handlers ────────────────────────────────────────────────

async function handleRepl(): Promise<void> {
  const { startRepl } = await import("@johnhenry/jth-repl");
  await startRepl();
}

async function handleRun(argv: string[]): Promise<void> {
  const { isCode, input } = parseInput(argv, "run");
  try {
    const exitCode = await run(input, { isCode });
    process.exit(exitCode);
  } catch (err: any) {
    reportError(err);
    process.exit(1);
  }
}

async function handleCompile(argv: string[]): Promise<void> {
  const bundle = !argv.includes("--no-bundle");
  const filtered = argv.filter((a) => a !== "--no-bundle");
  const { isCode, input, extra } = parseInput(filtered, "compile");

  try {
    if (isCode) {
      // Inline code — always print the unbundled form to stdout
      const js = compile(input, { isCode: true });
      console.log(js);
    } else {
      // File input
      const output = extra || deriveOutputPath(input);
      if (bundle) {
        await compileBundled(input, { isCode: false, output });
        console.error(`Compiled (bundled): ${input} -> ${output}`);
      } else {
        compile(input, { isCode: false, output });
        console.error(`Compiled: ${input} -> ${output}`);
      }
    }
  } catch (err: any) {
    reportError(err);
    process.exit(1);
  }
}

/**
 * Parse input arguments for run/compile commands.
 */
function parseInput(argv: string[], commandName: string): { isCode: boolean; input: string; extra: string | null } {
  if (argv.length === 0) {
    console.error(`Usage: jth ${commandName} <file> or jth ${commandName} -c '<code>'`);
    process.exit(1);
  }

  if (argv[0] === "-c") {
    if (!argv[1]) {
      console.error(`Missing code after -c flag.`);
      process.exit(1);
    }
    return { isCode: true, input: argv[1], extra: null };
  }

  return { isCode: false, input: argv[0], extra: argv[1] || null };
}
