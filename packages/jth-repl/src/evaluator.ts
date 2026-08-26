import { Stack } from "@johnhenry/jth-runtime";
import { run } from "@johnhenry/jth-compiler";
import "@johnhenry/jth-stdlib";
import { ScopedRegistry, JthContext } from "@johnhenry/jth-eval";
import type { SandboxOption } from "@johnhenry/jth-eval";

export interface CreateEvaluatorOptions {
  /**
   * Opt into sandboxed evaluation. When set (anything other than the
   * default `false`), evaluate() routes through jth-eval's JthContext
   * instead of calling jth-compiler's run() directly: inline JS (`((...))`)
   * and `::name` value-definitions are rejected at compile time, and
   * operator resolution is filtered through an allowlist (see jth-eval's
   * SandboxOption: `true` = bare/no-stdlib, `"restricted"` = stdlib minus
   * I/O ops, or an explicit `string[]` allowlist).
   *
   * Defaults to `false` (current, unsandboxed behavior) to avoid a
   * breaking change: by default, inline JS with full process/filesystem/
   * network access runs completely unrestricted through both `jth run -c`
   * and the interactive REPL. Pass a sandbox option for untrusted input.
   */
  sandbox?: SandboxOption;
}

/** Common surface returned by createEvaluator(), regardless of sandbox mode. */
export interface Evaluator {
  evaluate(source: string): Promise<Stack>;
  getStack(): Stack;
  peek(): unknown;
  toArray(): unknown[];
  clear(): void;
  readonly length: number;
}

/**
 * Create a persistent jth evaluator that maintains stack state
 * across successive evaluate() calls.
 */
export function createEvaluator(options: CreateEvaluatorOptions = {}): Evaluator {
  const { sandbox = false } = options;

  if (sandbox !== false) {
    return createSandboxedEvaluator(sandbox);
  }
  return createUnsandboxedEvaluator();
}

/**
 * Default (unsandboxed) evaluator: calls jth-compiler's run() directly,
 * exactly like before -- except each evaluator now gets its OWN registry
 * instance (a ScopedRegistry with no allowlist, i.e. full fallback to the
 * real stdlib) instead of relying on run()'s default of jth-compiler's
 * shared module-level registry. Without this, two independently-created
 * evaluators in the same process would see each other's `:name`
 * definitions (see jth/issues/48) -- ScopedRegistry's local overlay keeps
 * writes (`:name`) per-instance while reads still fall through to the
 * real global stdlib registry, so existing single-evaluator behavior is
 * unchanged.
 */
function createUnsandboxedEvaluator(): Evaluator {
  const stack = new Stack();
  const registry = new ScopedRegistry({ allowlist: null });

  return {
    async evaluate(source: string): Promise<Stack> {
      await run(source, { stack, registry });
      return stack;
    },
    getStack(): Stack {
      return stack;
    },
    peek(): unknown {
      return stack.peek();
    },
    toArray(): unknown[] {
      return stack.toArray();
    },
    clear(): void {
      stack.clear();
    },
    get length(): number {
      return stack.length;
    },
  };
}

/**
 * Sandboxed evaluator: delegates entirely to jth-eval's JthContext, which
 * already wires up the allowlist, forbidInlineJS (rejects inline JS and
 * ::name), and an isolated registry. JthContext doesn't expose its
 * internal Stack instance directly, so getStack()/evaluate() return a
 * fresh Stack snapshot of its current contents on each call rather than a
 * single live, mutated-in-place instance (unlike the unsandboxed path).
 */
function createSandboxedEvaluator(sandbox: SandboxOption): Evaluator {
  const ctx = new JthContext({ sandbox });

  const snapshot = (): Stack => {
    const s = new Stack();
    s.push(...ctx.toArray());
    return s;
  };

  return {
    async evaluate(source: string): Promise<Stack> {
      await ctx.eval(source);
      return snapshot();
    },
    getStack(): Stack {
      return snapshot();
    },
    peek(): unknown {
      return ctx.peek();
    },
    toArray(): unknown[] {
      return ctx.toArray();
    },
    clear(): void {
      ctx.clear();
    },
    get length(): number {
      return ctx.length;
    },
  };
}
