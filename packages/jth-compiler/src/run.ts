/**
 * The single shared "run a jth program" pipeline:
 * transform (lex → parse → generate) + new Function + execute.
 *
 * Every in-process consumer (jth-repl's evaluator, jth-eval's evalJth and
 * JthContext, the e2e test helper) executes through run(); this file owns
 * the ONLY `new Function` execution site for jth programs.
 *
 * Note: run() does not register the standard library. Callers that want
 * stdlib words must `import "jth-stdlib"` themselves (all current callers
 * do), or pass a pre-populated registry.
 */

import { Stack, processN, registry as globalRegistry } from "jth-runtime";
import { transform } from "./transform.ts";

/** Minimal registry surface the generated code needs (`registry.resolve`). */
export interface RegistryLike {
  resolve(name: string): unknown;
  set(name: string, fn: unknown): void;
}

export interface RunOptions {
  /**
   * Registry the program resolves operators against (e.g. jth-eval's
   * sandbox ScopedRegistry). Defaults to the global jth-runtime registry.
   */
  registry?: RegistryLike;
  /**
   * Stack to execute against. Defaults to a fresh Stack; persistent
   * consumers (REPL, JthContext) pass their own.
   */
  stack?: Stack;
  /** Max execution time in ms. 0 (default) disables the timeout. */
  timeoutMs?: number;
  /** Capture console.log lines emitted during execution. */
  captureLog?: boolean;
  /**
   * Reject inline JS (`((...))`) at compile time with OP_NOT_ALLOWED.
   * Sandboxed consumers (jth-eval) set this: inline JS trivially escapes
   * any operator allowlist.
   */
  forbidInlineJS?: boolean;
}

export interface RunResult {
  /** The stack the program ran against (same instance as opts.stack). */
  stack: Stack;
  /** Top of the stack after execution (undefined if empty). */
  value: unknown;
  /** Captured console output ("" unless captureLog was set). */
  output: string;
}

/**
 * Compile and execute jth source. The generated code drives processN,
 * which keeps its sync-fast-path / async-promotion semantics; run()
 * simply awaits the wrapping async IIFE.
 */
export async function run(source: string, opts: RunOptions = {}): Promise<RunResult> {
  const {
    registry = globalRegistry,
    stack = new Stack(),
    timeoutMs = 0,
    captureLog = false,
    forbidInlineJS = false,
  } = opts;

  const js = transform(source, { preamble: false, forbidInlineJS });

  // The generated code references `stack`, `processN`, and `registry`.
  // Wrap in an async IIFE so top-level `await processN(...)` works.
  const fn = new Function(
    "stack",
    "processN",
    "registry",
    `return (async () => {\n${js}\n})();`
  ) as (stack: Stack, processN: unknown, registry: RegistryLike) => Promise<void>;

  const outputLines: string[] = [];
  const origLog = console.log;
  if (captureLog) {
    console.log = (...args: unknown[]) => {
      outputLines.push(args.map(String).join(" "));
    };
  }

  try {
    const execution = fn(stack, processN, registry);

    if (timeoutMs > 0) {
      await Promise.race([
        execution,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Evaluation timed out after ${timeoutMs}ms`)),
            timeoutMs
          )
        ),
      ]);
    } else {
      await execution;
    }
  } finally {
    if (captureLog) {
      console.log = origLog;
    }
  }

  const arr = stack.toArray();
  return {
    stack,
    value: arr.length > 0 ? arr[arr.length - 1] : undefined,
    output: outputLines.join("\n"),
  };
}
