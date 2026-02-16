import { Stack, processN, registry } from "jth-runtime";
import { lex, parse, generate } from "jth-compiler";
import "jth-stdlib";

/**
 * Create a persistent jth evaluator that maintains stack state
 * across successive evaluate() calls.
 */
export function createEvaluator() {
  const stack = new Stack();

  return {
    /**
     * Compile and evaluate jth source against the persistent stack.
     * @param {string} source - jth source code (one or more statements)
     * @returns {Promise<Stack>} the stack after evaluation
     */
    async evaluate(source) {
      const tokens = lex(source);
      const ast = parse(tokens);
      const js = generate(ast, { preamble: false });

      // The generated code references `stack`, `processN`, and `registry`.
      // Wrap in an async IIFE so top-level `await processN(...)` works.
      const fn = new Function(
        "stack",
        "processN",
        "registry",
        `return (async () => {\n${js}\n})();`,
      );

      await fn(stack, processN, registry);
      return stack;
    },

    /** Return the underlying Stack instance. */
    getStack() {
      return stack;
    },

    /** Return the top element without modifying the stack. */
    peek() {
      return stack.peek();
    },

    /** Return a plain array copy of the stack contents. */
    toArray() {
      return stack.toArray();
    },

    /** Remove all items from the stack. */
    clear() {
      stack.clear();
    },

    /** Number of items currently on the stack. */
    get length() {
      return stack.length;
    },
  };
}
