import type { Stack } from "./stack.ts";

export type StackOperator = ((stack: Stack) => void | Promise<void>) & {
  _arity?: number;
  _name?: string;
};

/**
 * Create a fixed-arity stack operator.
 * Returns a function: (fn) => stackOperator
 * where stackOperator takes a Stack and pops `arity` items, calls fn, pushes results.
 */
export function op(arity: number) {
  return function (fn: (...args: any[]) => unknown[] | void | Promise<unknown[] | void>): StackOperator {
    const stackOp: StackOperator = function (stack: Stack) {
      const args = stack.popN(arity);
      const results = fn(...args);
      // Handle async (Promise) results — return the Promise so processN can detect it
      if (results && typeof (results as Promise<unknown>).then === "function") {
        return (results as Promise<unknown[] | void>).then((resolved) => {
          if (Array.isArray(resolved)) {
            stack.push(...resolved);
          }
        });
      }
      if (Array.isArray(results)) {
        stack.push(...results);
      }
    };
    stackOp._arity = arity;
    stackOp._name = fn.name || undefined;
    return stackOp;
  };
}

/**
 * Create a variadic stack operator (consumes all items).
 */
export function variadic(fn: (...args: any[]) => unknown[] | void | Promise<unknown[] | void>): StackOperator {
  const stackOp: StackOperator = function (stack: Stack) {
    const args = stack.toArray();
    stack.clear();
    const results = fn(...args);
    // Handle async (Promise) results — return the Promise so processN can detect it
    if (results && typeof (results as Promise<unknown>).then === "function") {
      return (results as Promise<unknown[] | void>).then((resolved) => {
        if (Array.isArray(resolved)) {
          stack.push(...resolved);
        }
      });
    }
    if (Array.isArray(results)) {
      stack.push(...results);
    }
  };
  stackOp._arity = Infinity;
  stackOp._name = fn.name || undefined;
  return stackOp;
}
