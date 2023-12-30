// import { CALLING_STACK_FUNCTION } from "../process-n.mjs";
export const EMPTY_ARGUMENT = Symbol("EMPTY_ARGUMENT");
export const applyLastN =
  (n = Infinity, empty = false, EMPTY = EMPTY_ARGUMENT) =>
  (fn = clear, dropArgs = true) =>
  (...rest) => {
    const args = [];
    for (let i = 0; i < n; i++) {
      if (rest.length) {
        args.push(rest.pop());
      } else {
        if (empty) {
          args.push(EMPTY);
        }
      }
    }
    return [
      ...rest,
      ...(dropArgs ? [] : args.filter((arg) => arg !== EMPTY_ARGUMENT)),
      ...fn(...args),
    ];
  };
export const attackStack = (stackattack, ...stackDefaults) =>
  function (...stack) {
    if (this !== Symbol.for("CALLING_STACK_FUNCTION")) {
      // return stackattack.call(
      //   CALLING_STACK_FUNCTION,
      //   stack[0] ?? Infinity
      // );

      return stackattack.call(Symbol.for("CALLING_STACK_FUNCTION"), ...stack);
    }
    return stackattack(...stackDefaults)(...stack);
  };

export const collapseBinary =
  (n = 2, binary = (a, b) => [a, b]) =>
  (...stack) => {
    if (stack.length < 2) {
      return stack;
    }
    while (stack.length > 1 && n > 1) {
      n--;
      const a = stack.pop();
      const b = stack.pop();
      stack.push(...binary(a, b));
    }
    return stack;
  };
