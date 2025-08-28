// import { CALLING_STACK_FUNCTION } from "../process-n.mjs";
export const EMPTY_ARGUMENT = Symbol("EMPTY_ARGUMENT");
/**
 * @description Create stack function creates a function that applies last n arguments to a function
 * @param {*} n - Number of arguments to apply
 * @param {boolean} empty - Whether to apply empty arguments if stack is too short
 * @param {*} EMPTY - argument signifying empty argument
 * @returns {function}
 * |
 */
export const applyLastN =
  (n = Infinity, empty = false, EMPTY = EMPTY_ARGUMENT) =>
  /**
   *
   * @param {*} fn - Function to apply arguments to
   * @param {boolean} dropArgs - Whether to drop arguments from stack
   * @returns {function} - Stack function
   */
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

/**
 * @description A helper for creating stack functions
 * @param {function} stackattack
 * @param {any} stackDefaults
 * @returns {function}
 */
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

/**
 * @description Collapse the stack by repeatedly applying a binary function
 * @param {number} n
 * @param {function} binary
 * @returns {function}
 */
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

const splitArgs = (left, take = 0) => {
  const taken = left.splice(-take);
  return [left, taken];
};

/**
 * @description A helper for creating stack functions
 * @param {function} func
 * @param {object} bindObject
 * @param {number} take
 * @param {boolean} wrapOutputInArray
 * @returns {function}
 */
export const stackify = (
  func,
  bindObject = undefined,
  take = Infinity,
  wrapOutputInArray = true
) => {
  if (bindObject !== undefined) {
    func = func.bind(bindObject);
  }
  if (wrapOutputInArray) {
    return (...args) => {
      const [left, taken] = splitArgs(args, take);
      return [...left, func(...taken)];
    };
  } else {
    return (...args) => func(...args);
  }
};
