import { createInterface } from "node:readline";
import { createEvaluator } from "./evaluator.mjs";

export { createEvaluator } from "./evaluator.mjs";

/**
 * Start the interactive jth REPL.
 * Reads lines from stdin, evaluates them as jth source, and prints the
 * resulting stack after each evaluation.
 */
export async function startRepl() {
  const evaluator = createEvaluator();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "jth> ",
  });

  console.log("jth 2.0 REPL. Type .help for commands, .exit to quit.");
  rl.prompt();

  rl.on("line", async (line) => {
    const trimmed = line.trim();

    // Dot-commands
    if (trimmed === ".exit" || trimmed === ".quit") {
      rl.close();
      return;
    }
    if (trimmed === ".help") {
      console.log("Commands: .peek, .count, .clear, .stack, .exit");
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
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
