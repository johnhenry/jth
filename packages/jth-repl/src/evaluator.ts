import { Stack } from "jth-runtime";
import { run } from "jth-compiler";
import "jth-stdlib";

/**
 * Create a persistent jth evaluator that maintains stack state
 * across successive evaluate() calls.
 */
export function createEvaluator() {
  const stack = new Stack();

  return {
    /**
     * Compile and evaluate jth source against the persistent stack
     * (via the shared jth-compiler run() pipeline).
     */
    async evaluate(source: string): Promise<Stack> {
      await run(source, { stack });
      return stack;
    },

    /** Return the underlying Stack instance. */
    getStack(): Stack {
      return stack;
    },

    /** Return the top element without modifying the stack. */
    peek(): unknown {
      return stack.peek();
    },

    /** Return a plain array copy of the stack contents. */
    toArray(): unknown[] {
      return stack.toArray();
    },

    /** Remove all items from the stack. */
    clear(): void {
      stack.clear();
    },

    /** Number of items currently on the stack. */
    get length(): number {
      return stack.length;
    },
  };
}
