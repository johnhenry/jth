import { Stack, registry, op } from "@johnhenry/jth-runtime";
import type { StackOperator } from "@johnhenry/jth-runtime";
import { run } from "@johnhenry/jth-compiler";
import { stdlibOpNames } from "@johnhenry/jth-stdlib";
import { JthRuntimeError } from "@johnhenry/jth-types";
import { ScopedRegistry } from "./scoped-registry.ts";

/**
 * Restricted-op policy for `sandbox: "restricted"`:
 *
 * The allowlist is the set of static ops registered by jth-stdlib itself
 * (`stdlibOpNames()`) that are still registered, MINUS this set. Ops
 * registered into the process-global registry by OTHER packages (e.g.
 * jth-html's `h-raw`/`h-render`) are never admitted by "restricted" — they
 * must be allow-listed explicitly with `sandbox: [...]`. Excluded here is
 * every stdlib op that touches the world outside the evaluation. jth-stdlib
 * is almost entirely pure/computational; its only side-effecting ops are
 * the printers:
 *
 *   - `peek` / `peek-all` — write to the host console
 *
 * Additionally, and independently of this set:
 *   - Inline JS (`((...))`) is rejected at compile time in every sandbox
 *     mode (it escapes any allowlist) — see forbidInlineJS below.
 *   - Dynamic pattern ops (e.g. "3+", "2log", "***") are default-denied
 *     in restricted mode because patterns cannot be enumerated into an
 *     allowlist. Only the statically named ops resolve.
 *
 * Any `sandbox` value that is not `false`, `true`, `"restricted"` or an
 * array is rejected (INVALID_SANDBOX): the sandbox fails closed.
 */
const RESTRICTED_OPS = new Set<string>(["peek", "peek-all"]);

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
  // In any sandbox mode, inline JS is rejected at compile time — it would
  // trivially escape the operator allowlist.
  const { value, output } = await run(code, {
    stack,
    registry: scopedRegistry,
    timeoutMs: timeout,
    captureLog: captureOutput,
    forbidInlineJS: sandbox !== false,
  });

  return {
    value,
    stack: stack.toArray(),
    output,
  };
}

/**
 * Build an allowlist Set for sandbox mode, or null for no filtering.
 * Shared by evalJth and JthContext.
 */
export function buildAllowlist(sandbox: SandboxOption): Set<string> | null {
  if (sandbox === false) return null; // Full access

  if (sandbox === true) {
    // Bare mode: only injected values/operators, no stdlib
    return new Set();
  }

  if (sandbox === "restricted") {
    // Default-deny: every statically registered op name, minus the
    // restricted (side-effecting) set. Dynamic pattern ops are not
    // enumerable and therefore stay denied.
    const registered = new Set(registry.names());
    const all = new Set<string>();
    for (const name of stdlibOpNames()) {
      if (registered.has(name) && !RESTRICTED_OPS.has(name)) all.add(name);
    }
    return all;
  }

  if (Array.isArray(sandbox)) {
    // Explicit allowlist
    return new Set(sandbox);
  }

  // Fail CLOSED: anything unrecognized (typo, wrong case, null, a value read
  // from config/JSON) must never fall through to "full access".
  throw new JthRuntimeError(
    `Invalid sandbox option: ${describeSandbox(sandbox)}. ` +
      'Expected false, true, "restricted", or an array of operator names.',
    undefined,
    undefined,
    "INVALID_SANDBOX"
  );
}

function describeSandbox(value: unknown): string {
  try {
    return typeof value === "string" ? JSON.stringify(value) : String(JSON.stringify(value) ?? value);
  } catch {
    return typeof value;
  }
}
