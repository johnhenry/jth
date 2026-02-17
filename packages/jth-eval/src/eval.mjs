import { Stack, processN, registry, op, variadic } from "jth-runtime";
import { lex, parse, generate } from "jth-compiler";
import "jth-stdlib";
import { ScopedRegistry } from "./scoped-registry.mjs";

// Operators considered IO/shell/network for "restricted" sandbox mode.
// Currently jth-stdlib has no such operators, but this future-proofs the list.
const RESTRICTED_OPS = new Set([]);

/**
 * One-shot jth evaluation.
 *
 * @param {string} code - jth source code to evaluate
 * @param {object} [options]
 * @param {Record<string, any>} [options.values] - Named values injected as zero-arity operators
 * @param {Record<string, Function>} [options.operators] - Custom operator functions
 * @param {any[]} [options.stack] - Pre-load the stack before evaluation
 * @param {number} [options.timeout] - Max execution time in ms (default: 5000)
 * @param {boolean|"restricted"|string[]} [options.sandbox] - Control stdlib availability
 * @param {boolean} [options.captureOutput] - Capture console.log output (default: true)
 * @returns {Promise<EvalResult>}
 */
export async function evalJth(code, options = {}) {
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

  // Compile jth to JS
  const tokens = lex(code);
  const ast = parse(tokens);
  const js = generate(ast, { preamble: false });

  // Build the execution function
  const fn = new Function(
    "stack",
    "processN",
    "registry",
    `return (async () => { ${js} })();`
  );

  // Set up output capture
  const outputLines = [];
  const origLog = console.log;
  if (captureOutput) {
    console.log = (...args) => {
      outputLines.push(args.map(String).join(" "));
    };
  }

  try {
    // Execute with timeout
    const execution = fn(stack, processN, scopedRegistry);

    if (timeout > 0) {
      await Promise.race([
        execution,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Evaluation timed out after ${timeout}ms`)), timeout)
        ),
      ]);
    } else {
      await execution;
    }
  } finally {
    if (captureOutput) {
      console.log = origLog;
    }
  }

  const resultStack = stack.toArray();
  return {
    value: resultStack.length > 0 ? resultStack[resultStack.length - 1] : undefined,
    stack: resultStack,
    output: outputLines.join("\n"),
  };
}

/**
 * Build an allowlist Set for sandbox mode, or null for no filtering.
 */
function buildAllowlist(sandbox) {
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
function collectGlobalNames() {
  // We'll use a known comprehensive list of all stdlib operators
  const names = [
    // Stack ops
    "noop", "\u2205", "clear", "...", "spread", "drop", "dupe", "dup", "copy",
    "swap", "reverse", "count", "depth", "collect", "peek", "peek-all",
    "apply", "exec", "over", "rot",
    // Arithmetic
    "+", "-", "*", "\u22C5", "/", "\u00F7", "**", "%", "%%", "++", "--",
    "\u03A3", "\u03A0", "abs", "|\uD835\uDC65|", "\u221A", "sqrt",
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
    "x\u0304", "mean", "median", "mode", "modes",
  ];

  const found = new Set();
  for (const name of names) {
    if (registry.has(name)) {
      found.add(name);
    }
  }
  return found;
}
