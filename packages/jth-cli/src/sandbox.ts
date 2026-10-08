/**
 * `--sandbox[=mode]` support for `jth run` and `jth repl` (issue #50).
 *
 * Modes (mapped onto jth-eval's SandboxOption):
 *   --sandbox              restricted (same as --sandbox=restricted)
 *   --sandbox=restricted   pure stdlib ops; no inline JS, no ::name, no peek/peek-all
 *   --sandbox=bare         no stdlib at all (nothing resolves)
 *   --sandbox=a,b,c        explicit allowlist of operator names
 *
 * Parsing fails CLOSED: an empty or malformed value is an error, never a
 * silent fallback to unsandboxed execution.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type CliSandbox = true | "restricted" | string[];

export class SandboxFlagError extends Error {}

export interface ParsedSandboxFlag {
  /** undefined when the flag was not given (unsandboxed, the default). */
  sandbox: CliSandbox | undefined;
  /** argv with every --sandbox flag removed. */
  rest: string[];
}

export function parseSandboxFlag(argv: string[]): ParsedSandboxFlag {
  let sandbox: CliSandbox | undefined;
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    // Everything after `-c` is its code argument; never treat it as a flag.
    if (arg === "-c") {
      rest.push(arg);
      if (i + 1 < argv.length) rest.push(argv[++i]);
      continue;
    }
    if (arg === "--sandbox") {
      sandbox = "restricted";
    } else if (arg.startsWith("--sandbox=")) {
      sandbox = parseMode(arg.slice("--sandbox=".length));
    } else {
      rest.push(arg);
    }
  }
  return { sandbox, rest };
}

function parseMode(value: string): CliSandbox {
  if (value === "restricted") return "restricted";
  if (value === "bare") return true;
  const names = value.split(",").map((n) => n.trim());
  if (value === "" || names.some((n) => n === "")) {
    throw new SandboxFlagError(
      `Invalid --sandbox value "${value}". Use --sandbox, --sandbox=restricted, ` +
        "--sandbox=bare, or --sandbox=<op>,<op>,... (comma-separated operator names)."
    );
  }
  return names;
}

/**
 * Run jth source in a sandboxed in-process evaluator and print the final
 * stack to stdout, one item per line (restricted mode has no peek, so the
 * stack is the program's result). Returns the process exit code.
 */
export async function runSandboxed(
  input: string,
  isCode: boolean,
  sandbox: CliSandbox
): Promise<number> {
  const source = isCode ? input : readFileSync(resolve(input), "utf-8");
  const { createEvaluator } = await import("@johnhenry/jth-repl");
  const evaluator = createEvaluator({ sandbox });
  await evaluator.evaluate(source);
  for (const item of evaluator.toArray()) console.log(item);
  return 0;
}
