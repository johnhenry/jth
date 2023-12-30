export const META = Symbol.for("PROCESS_META");
export const CALLING_STACK_FUNCTION = Symbol.for("CALLING_STACK_FUNCTION");
export const unwrap = (_) => {
  let wrapped = {};
  if (typeof _ === "function" && _[META] !== undefined) {
    wrapped = _[META];
    _ = _();
  }
  return { _, ...wrapped };
};

export const wrap = (f, vals = {}) => {
  const { _, ...wrapped } = unwrap(f);
  const fu = () => _;
  fu[META] = { ...wrapped, ...vals };
  return fu;
};

export const processN =
  (start = 0, history, herstory) =>
  async (...future) => {
    const processed = history || [];
    const stack = herstory || [];
    stack.push(...future);
    for (let i = 0; i < start; i++) {
      if (stack.length) {
        processed.push(stack.shift());
      }
    }
    while (stack.length) {
      const { _, delay, limit, rewind, persist, skip } = unwrap(stack.shift());
      if (typeof _ === "function") {
        if (skip !== undefined) {
          if (skip === -1 || skip === undefined) {
            while (stack.length) {
              processed.push(stack.shift());
            }
          } else {
            for (let i = 0; i < skip; i++) {
              if (!stack.length) {
                break;
              }
              processed.push(stack.shift());
            }
          }
        }

        if (delay) {
          processed.push(
            wrap(_, { delay: delay - 1, limit, rewind, persist, skip })
          );
        } else {
          const preProcessed = [];
          if (limit === -1 || limit === undefined) {
            while (processed.length) {
              preProcessed.unshift(processed.pop());
            }
          } else {
            for (let i = 0; i < limit; i++) {
              if (processed.length) {
                preProcessed.unshift(processed.pop());
              }
            }
          }
          // Call function
          processed.push(
            ...(await _.call(CALLING_STACK_FUNCTION, ...preProcessed))
          );

          if (persist) {
            processed.push(
              wrap(_, { persist: persist - 1, limit, rewind, delay, skip })
            );
          }

          if (rewind !== undefined) {
            if (rewind === -1) {
              while (processed.length) {
                stack.unshift(processed.pop());
              }
            } else {
              for (let i = 0; i < rewind; i++) {
                if (processed.length) {
                  stack.unshift(processed.pop());
                }
              }
            }
          }
        }
      } else {
        processed.push(_);
      }
    }
    return processed;
  };

// //TODO: Is this right?
// export const applyStackFunction = (fn, start = 0) => {
//   const proc = processN(start);
//   return (newStack) => proc(...newStack, fn);
// };
// export const compose = (...funcs) => {
//   return [
//     (...stack) => {
//       for (const fn of funcs) {
//         stack = applyStackFunction(fn)(stack);
//       }
//       return stack;
//     },
//   ];
// };
export default processN;
