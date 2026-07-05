import { Stack, registry, op } from "jth-runtime";
import type { StackOperator } from "jth-runtime";
import { run } from "jth-compiler";
import "jth-stdlib";
import { ScopedRegistry } from "./scoped-registry.ts";

// Operators considered IO/shell/network for "restricted" sandbox mode.
// Currently jth-stdlib has no such operators, but this future-proofs the list.
const RESTRICTED_OPS = new Set<string>([]);

export type SandboxOption = boolean | "restricted" | string[];

export interface EvalOptions {
  /** Named values injected as zero-arity operators. */
  values?: Record<string, unknown>;
  /** Custom operator functions. */
  operators?: Record<string, StackOperator>;
  /** Pre-load the stack before evaluation. */
  stack?: unknown[];
  /** Max execution time in ms (default: 5000). */
  timeout?: number;
  /** Control stdlib availability. */
  sandbox?: SandboxOption;
  /** Capture console.log output (default: true). */
  captureOutput?: boolean;
}

export interface EvalResult {
  /** Top of the stack after execution (undefined if empty). */
  value: unknown;
  /** Full stack contents after execution. */
  stack: unknown[];
  /** Captured console output ("" unless captureOutput). */
  output: string;
}

/**
 * One-shot jth evaluation.
 */
export async function evalJth(
  code: string,
  options: EvalOptions = {}
): Promise<EvalResult> {
  const {
    values = {},
    operators = {},
    stack: preloadStack = [],
    timeout = 5000,
    sandbox = false,
    captureOutput = true,
  } = options;

  // Build allowlist for sandbox mode
  const allowlist = buildAllowlist(sandbox);

  // Create scoped registry
  const scopedRegistry = new ScopedRegistry({
    allowlist,
  });

  // Inject values as zero-arity operators
  for (const [name, value] of Object.entries(values)) {
    scopedRegistry.set(name, op(0)(() => [value]));
  }

  // Inject custom operators
  for (const [name, fn] of Object.entries(operators)) {
    scopedRegistry.set(name, fn);
  }

  // Create stack and pre-load
  const stack = new Stack();
  if (preloadStack.length > 0) {
    stack.push(...preloadStack);
  }

  // Execute through the shared jth-compiler run() pipeline, passing the
  // sandbox registry, timeout, and output capture through RunOptions.
  const { value, output } = await run(code, {
    stack,
    registry: scopedRegistry,
    timeoutMs: timeout,
    captureLog: captureOutput,
  });

  return {
    value,
    stack: stack.toArray(),
    output,
  };
}

/**
 * Build an allowlist Set for sandbox mode, or null for no filtering.
 */
function buildAllowlist(sandbox: SandboxOption): Set<string> | null {
  if (sandbox === false) return null; // Full access

  if (sandbox === true) {
    // Bare mode: only injected values/operators, no stdlib
    return new Set();
  }

  if (sandbox === "restricted") {
    // All stdlib minus restricted ops — collect all registered names
    // and exclude RESTRICTED_OPS
    const all = collectGlobalNames();
    for (const name of RESTRICTED_OPS) {
      all.delete(name);
    }
    return all;
  }

  if (Array.isArray(sandbox)) {
    // Explicit allowlist
    return new Set(sandbox);
  }

  return null;
}

/**
 * Collect all currently registered operator names from the global registry.
 * We probe known operator names since the registry doesn't expose iteration.
 */
function collectGlobalNames(): Set<string> {
  // We'll use a known comprehensive list of all stdlib operators
  const names = [
    // Stack ops
    "noop", "∅", "clear", "...", "spread", "drop", "dupe", "dup", "copy",
    "swap", "reverse", "count", "depth", "collect", "peek", "peek-all",
    "apply", "exec", "over", "rot",
    // Arithmetic
    "+", "-", "*", "⋅", "/", "÷", "**", "%", "%%", "++", "--",
    "Σ", "Π", "abs", "|𝑥|", "√", "sqrt",
    "floor", "ceil", "round", "trunc", "log", "min", "max",
    "plus", "minus", "mul", "div", "mod", "pow",
    // Comparison
    "=", "==", "<", "<=", ">", ">=", "<=>",
    "eq?", "ne?", "!=", "lt?", "le?", "gt?", "ge?",
    // Logic
    "&&", "||", "xor", "nand", "nor", "~~", "not",
    // Control flow
    "if", "elseif", "else", "when", "drop-when", "keep-if", "drop-if",
    "times", "while", "until", "break",
    // Error handling
    "try", "throw", "error?",
    // String ops
    "len", "upper", "lower", "trim", "strcat", "strseq",
    "startsWith", "endsWith", "indexOf", "starts?", "ends?", "index-of",
    // Type ops
    "typeof", "number?", "string?", "array?", "nil?", "function?",
    "empty?", "contains?",
    // Serialization
    "into-json", "to-json", "from-json", "into-lines", "from-lines", "to-lines",
    // Array ops
    "push", "pop", "shift", "unshift", "suppose", "flatten",
    "map", "filter", "reduce", "fold", "bend",
    // Dict ops
    "keys", "values", "entries", "merge", "record",
    // Combinators
    "each", "fanout", "zip", "compose",
    // Async ops
    "_", "__",
    // Meta ops
    "$", "$$", "<<-", "->>",
    // Iterator ops
    "next", "iter", "..",
    // Sequences
    "fibonacci",
    // Statistics
    "x̄", "mean", "median", "mode", "modes",
  ];

  const found = new Set<string>();
  for (const name of names) {
    if (registry.has(name)) {
      found.add(name);
    }
  }
  return found;
}
