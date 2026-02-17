import { Stack, processN, op } from "jth-runtime";
import { lex, parse, generate } from "jth-compiler";
import "jth-stdlib";
import { ScopedRegistry } from "./scoped-registry.mjs";

/**
 * Persistent jth evaluation context.
 * Maintains stack and registry state across multiple eval() calls.
 */
export class JthContext {
  #stack;
  #registry;
  #timeout;
  #captureOutput;
  #disposed = false;

  /**
   * @param {object} [options]
   * @param {number} [options.timeout] - Default max execution time in ms (default: 5000)
   * @param {boolean|"restricted"|string[]} [options.sandbox] - Control stdlib availability
   * @param {boolean} [options.captureOutput] - Capture output (default: true)
   */
  constructor(options = {}) {
    const { timeout = 5000, sandbox = false, captureOutput = true } = options;
    this.#timeout = timeout;
    this.#captureOutput = captureOutput;
    this.#stack = new Stack();

    // Build allowlist if sandbox mode is set
    let allowlist = null;
    if (sandbox === true) {
      allowlist = new Set();
    } else if (sandbox === "restricted") {
      // All stdlib names (restricted ops excluded — none currently)
      allowlist = null; // full access for now, since no restricted ops exist
    } else if (Array.isArray(sandbox)) {
      allowlist = new Set(sandbox);
    }

    this.#registry = new ScopedRegistry({ allowlist });
  }

  /**
   * Evaluate jth code using the persistent stack and registry.
   * @param {string} code - jth source code
   * @param {object} [options]
   * @param {number} [options.timeout] - Override timeout for this evaluation
   * @returns {Promise<{value: any, stack: any[], output: string}>}
   */
  async eval(code, options = {}) {
    this.#assertNotDisposed();
    const timeout = options.timeout ?? this.#timeout;

    const tokens = lex(code);
    const ast = parse(tokens);
    const js = generate(ast, { preamble: false });

    const fn = new Function(
      "stack",
      "processN",
      "registry",
      `return (async () => { ${js} })();`
    );

    const outputLines = [];
    const origLog = console.log;
    if (this.#captureOutput) {
      console.log = (...args) => {
        outputLines.push(args.map(String).join(" "));
      };
    }

    try {
      const execution = fn(this.#stack, processN, this.#registry);

      if (timeout > 0) {
        await Promise.race([
          execution,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Evaluation timed out after ${timeout}ms`)),
              timeout
            )
          ),
        ]);
      } else {
        await execution;
      }
    } finally {
      if (this.#captureOutput) {
        console.log = origLog;
      }
    }

    const resultStack = this.#stack.toArray();
    return {
      value: resultStack.length > 0 ? resultStack[resultStack.length - 1] : undefined,
      stack: resultStack,
      output: outputLines.join("\n"),
    };
  }

  /**
   * Define a named value as a zero-arity operator.
   */
  define(name, value) {
    this.#assertNotDisposed();
    this.#registry.set(name, op(0)(() => [value]));
  }

  /**
   * Define a custom operator with fixed arity.
   * @param {string} name - Operator name
   * @param {number} arity - Number of stack items to consume
   * @param {Function} fn - Function receiving `arity` args, returns single value
   */
  defineOp(name, arity, fn) {
    this.#assertNotDisposed();
    this.#registry.set(name, op(arity)((...args) => [fn(...args)]));
  }

  /**
   * Push values onto the stack.
   */
  push(...values) {
    this.#assertNotDisposed();
    this.#stack.push(...values);
  }

  /**
   * Pop and return the top value from the stack.
   */
  pop() {
    this.#assertNotDisposed();
    return this.#stack.pop();
  }

  /**
   * Peek at the top value without removing it.
   */
  peek() {
    this.#assertNotDisposed();
    return this.#stack.peek();
  }

  /**
   * Clear the stack.
   */
  clear() {
    this.#assertNotDisposed();
    this.#stack.clear();
  }

  /**
   * Get the stack contents as an array.
   */
  toArray() {
    this.#assertNotDisposed();
    return this.#stack.toArray();
  }

  /**
   * Get the current stack length.
   */
  get length() {
    this.#assertNotDisposed();
    return this.#stack.length;
  }

  /**
   * Clean up the context.
   */
  dispose() {
    this.#stack.clear();
    this.#registry.clear();
    this.#disposed = true;
  }

  #assertNotDisposed() {
    if (this.#disposed) {
      throw new Error("JthContext has been disposed");
    }
  }
}
