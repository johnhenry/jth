import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createEvaluator } from "./evaluator.ts";

export { createEvaluator } from "./evaluator.ts";
export type { CreateEvaluatorOptions, Evaluator } from "./evaluator.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Version string, single-sourced from jth-repl's package.json so the
 * banner can never drift from the published version.
 */
export function getVersion(): string {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "..", "package.json"), "utf-8")
  );
  return pkg.version;
}

/**
 * Start the interactive jth REPL.
 * Reads lines from stdin, evaluates them as jth source, and prints the
 * resulting stack after each evaluation.
 */
export async function startRepl(): Promise<void> {
  const evaluator = createEvaluator();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "jth> ",
  });

  console.log(
    `jth ${getVersion()} REPL. Type .help for commands, .exit to quit.`
  );
  rl.prompt();

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();

    // Dot-commands
    if (trimmed === ".exit" || trimmed === ".quit") {
      rl.close();
      return;
    }
    if (trimmed === ".help") {
      console.log("Commands: .peek, .count, .clear, .stack, .version, .exit");
      rl.prompt();
      return;
    }
    if (trimmed === ".version") {
      console.log(getVersion());
      rl.prompt();
      return;
    }
    if (trimmed === ".peek") {
      console.log(evaluator.peek());
      rl.prompt();
      return;
    }
    if (trimmed === ".count") {
      console.log(evaluator.length);
      rl.prompt();
      return;
    }
    if (trimmed === ".clear") {
      evaluator.clear();
      console.log("Stack cleared.");
      rl.prompt();
      return;
    }
    if (trimmed === ".stack") {
      console.log(evaluator.toArray());
      rl.prompt();
      return;
    }
    if (!trimmed) {
      rl.prompt();
      return;
    }

    try {
      await evaluator.evaluate(trimmed);
      console.log(evaluator.toArray());
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
