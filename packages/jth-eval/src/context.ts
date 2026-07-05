import { Stack, op } from "jth-runtime";
import { JthRuntimeError } from "jth-types";
import { run } from "jth-compiler";
import "jth-stdlib";
import { ScopedRegistry } from "./scoped-registry.ts";
import { buildAllowlist } from "./eval.ts";
import type { SandboxOption, EvalResult } from "./eval.ts";

export interface JthContextOptions {
  /** Default max execution time in ms (default: 5000). */
  timeout?: number;
  /** Control stdlib availability. */
  sandbox?: SandboxOption;
  /** Capture output (default: true). */
  captureOutput?: boolean;
}

/**
 * Persistent jth evaluation context.
 * Maintains stack and registry state across multiple eval() calls.
 */
export class JthContext {
  #stack: Stack;
  #registry: ScopedRegistry;
  #timeout: number;
  #captureOutput: boolean;
  #forbidInlineJS: boolean;
  #disposed = false;

  constructor(options: JthContextOptions = {}) {
    const { timeout = 5000, sandbox = false, captureOutput = true } = options;
    this.#timeout = timeout;
    this.#captureOutput = captureOutput;
    this.#stack = new Stack();

    // Sandbox: shared allowlist policy (see eval.ts). In any sandbox mode,
    // inline JS is rejected at compile time — it escapes the allowlist.
    const allowlist = buildAllowlist(sandbox);
    this.#forbidInlineJS = sandbox !== false;
    this.#registry = new ScopedRegistry({ allowlist });
  }

  /**
   * Evaluate jth code using the persistent stack and registry.
   */
  async eval(
    code: string,
    options: { timeout?: number } = {}
  ): Promise<EvalResult> {
    this.#assertNotDisposed();
    const timeout = options.timeout ?? this.#timeout;

    // Execute through the shared jth-compiler run() pipeline against the
    // persistent stack and (possibly sandboxed) registry.
    const { value, output } = await run(code, {
      stack: this.#stack,
      registry: this.#registry,
      timeoutMs: timeout,
      captureLog: this.#captureOutput,
      forbidInlineJS: this.#forbidInlineJS,
    });

    return {
      value,
      stack: this.#stack.toArray(),
      output,
    };
  }

  /**
   * Define a named value as a zero-arity operator.
   */
  define(name: string, value: unknown): void {
    this.#assertNotDisposed();
    this.#registry.set(name, op(0)(() => [value]));
  }

  /**
   * Define a custom operator with fixed arity.
   * @param name - Operator name
   * @param arity - Number of stack items to consume
   * @param fn - Function receiving `arity` args, returns single value
   */
  defineOp(name: string, arity: number, fn: (...args: any[]) => unknown): void {
    this.#assertNotDisposed();
    this.#registry.set(name, op(arity)((...args: unknown[]) => [fn(...args)]));
  }

  /**
   * Push values onto the stack.
   */
  push(...values: unknown[]): void {
    this.#assertNotDisposed();
    this.#stack.push(...values);
  }

  /**
   * Pop and return the top value from the stack.
   */
  pop(): unknown {
    this.#assertNotDisposed();
    return this.#stack.pop();
  }

  /**
   * Peek at the top value without removing it.
   */
  peek(): unknown {
    this.#assertNotDisposed();
    return this.#stack.peek();
  }

  /**
   * Clear the stack.
   */
  clear(): void {
    this.#assertNotDisposed();
    this.#stack.clear();
  }

  /**
   * Get the stack contents as an array.
   */
  toArray(): unknown[] {
    this.#assertNotDisposed();
    return this.#stack.toArray();
  }

  /**
   * Get the current stack length.
   */
  get length(): number {
    this.#assertNotDisposed();
    return this.#stack.length;
  }

  /**
   * Clean up the context.
   */
  dispose(): void {
    this.#stack.clear();
    this.#registry.clear();
    this.#disposed = true;
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new JthRuntimeError(
        "JthContext has been disposed",
        undefined,
        undefined,
        "CONTEXT_DISPOSED"
      );
    }
  }
}
