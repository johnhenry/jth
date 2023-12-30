import { wrap } from "./process-n.mjs";
export const noop = (...args) => args;

export const rewindN =
  (n = 1) =>
  (f = noop) =>
    wrap(f, { rewind: n });

export const reset = rewindN(-1)();
export const back = rewindN()();

export const limitN =
  (n = -1) =>
  (f = noop) =>
    wrap(f, { limit: n });
export const delayN =
  (n = 1) =>
  (f = noop) =>
    wrap(f, { delay: n });
export const pause = delayN();

export const persistN =
  (n = Infinity) =>
  (f = noop) =>
    wrap(f, { persist: n });

export const skipN =
  (n = 1) =>
  (f = noop) =>
    wrap(f, { skip: n });

export const wrapify = (f) => {
  f.rewind = (n = 1) => rewindN(n)(f);
  f.limit = (n = 0) => limitN(n)(f);
  f.delay = (n = 1) => delayN(n)(f);
  f.persist = (n = Infinity) => persistN(n)(f);
  f.skip = (n = 1) => skipN(n)(f);
  return f;
};
export const swap = (...stack) => {
  if (stack.length > 1) {
    const a = stack.pop();
    const b = stack.pop();
    return [...stack, a, b];
  }
  return stack;
};
// wrapify(swap);

// (func, condenseInputToArray = false, wrapOutputInArray = true) =>
//   (...stack) => {
//     applyLastN(1)((x) => [Math.sin(x)]);

//     const result = condenseInputToArray ? func(stack) : func(...stack);
//     return wrapOutputInArray ? [result] : result;
//   };
