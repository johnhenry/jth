#!/usr/bin/env node

/**
 * jth CLI — compile and run .jth programs.
 *
 * Usage:
 *   jth run <file>              Compile and run a .jth file
 *   jth run -c '<code>'         Compile and run inline jth code
 *   jth compile <file> [output] Compile a .jth file to .mjs
 *   jth compile -c '<code>'     Compile inline jth code to stdout
 *   jth repl                    Start interactive REPL
 *   jth --version | -v          Print version
 *   jth --help | -h             Print help
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, deriveOutputPath } from "../src/compile.mjs";
import { run } from "../src/run.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion() {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "..", "package.json"), "utf-8")
  );
  return pkg.version;
}

const HELP = `
jth v${getVersion()} — stack-based language CLI

Usage:
  jth run <file>              Compile and execute a .jth file
  jth run -c '<code>'         Compile and execute inline jth code
  jth compile <file> [output] Compile a .jth file to .mjs
  jth compile -c '<code>'     Compile inline jth code (prints to stdout)
  jth repl                    Start interactive REPL
  jth --version, -v           Print version
  jth --help, -h              Print this help message

Examples:
  jth run hello.jth
  jth run -c '"hello" @;'
  jth compile math.jth math.mjs
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
    handleCompile(rest);
    break;

  case "repl":
    await handleRepl();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "jth --help" for usage information.');
    process.exit(1);
}

// ── Command handlers ────────────────────────────────────────────────

async function handleRepl() {
  const { startRepl } = await import("jth-repl");
  await startRepl();
}

async function handleRun(argv) {
  const { isCode, input } = parseInput(argv, "run");
  try {
    const exitCode = await run(input, { isCode });
    process.exit(exitCode);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function handleCompile(argv) {
  const { isCode, input, extra } = parseInput(argv, "compile");

  try {
    if (isCode) {
      // Inline code — always print to stdout
      const js = compile(input, { isCode: true });
      console.log(js);
    } else {
      // File input
      const output = extra || deriveOutputPath(input);
      compile(input, { isCode: false, output });
      console.error(`Compiled: ${input} -> ${output}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Parse input arguments for run/compile commands.
 *
 * Supports:
 *   -c '<code>'     inline code
 *   <file> [output] file path with optional output (compile only)
 */
function parseInput(argv, commandName) {
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
