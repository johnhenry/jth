/**
 * Create a fixed-arity stack operator.
 * Returns a function: (fn) => stackOperator
 * where stackOperator takes a Stack and pops `arity` items, calls fn, pushes results.
 */
export function op(arity) {
  return function (fn) {
    const stackOp = function (stack) {
      const args = stack.popN(arity);
      const results = fn(...args);
      // Handle async (Promise) results — return the Promise so processN can detect it
      if (results && typeof results.then === "function") {
        return results.then((resolved) => {
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
export function variadic(fn) {
  const stackOp = function (stack) {
    const args = stack.toArray();
    stack.clear();
    const results = fn(...args);
    // Handle async (Promise) results — return the Promise so processN can detect it
    if (results && typeof results.then === "function") {
      return results.then((resolved) => {
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
