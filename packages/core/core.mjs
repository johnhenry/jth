import { processN, CALLING_STACK_FUNCTION } from "./process-n.mjs";
import { applyLastN, attackStack, collapseBinary } from "./tools/index.mjs"; // jth-tools
export * from "./wrap.mjs";
export * from "./tools/index.mjs";
export * from "./async/index.mjs";
export * from "./logic/index.mjs";
export * from "./stat/index.mjs";
export * from "./unsorted/index.mjs";
export * from "./array/index.mjs";
export * from "./sequences/index.mjs";
export * from "./range/index.mjs";
export * from "./dict/index.mjs";
export * from "./iterator/index.mjs";

import { wait } from "./async/index.mjs";

export * from "./bitwise-logic/index.mjs";

/**
 * @description Do nothing
 * @param {any} args
 * @returns {any[]}
 */
export const noop = (...args) => args;

/**
 * @description Clear the stack
 * @param {boolean} guard
 * @returns {function}
 */
export const clear = function (guard) {
  if (this === CALLING_STACK_FUNCTION) {
    return [];
  }
  return (...stack) => (guard ? [] : stack);
};

/**
 * @description Log a message and do nothing
 * @param {any} message
 * @returns {function}
 */
export const forbidden =
  (...message) =>
  (...args) => {
    if (message.length) {
      console.log(...message);
    }
    return noop(...args);
  };

export const exhaustIterator = applyLastN(1)((a) => {
  return a[Symbol.iterator]
    ? [[...a]]
    : typeof a === object && a !== null
    ? [[Object.entries(a)]]
    : [a];
});

/**
 * @description Spread the last item on the stack
 * @param {any} a
 * @returns {any[]}
 */
export const spread = applyLastN(1)((a) => a);

/**
 * @description Drop n items from the stack
 * @param {number} n
 * @returns {function}
 */
export const drop = attackStack(
  (n) =>
    (...stack) => {
      let m = n;
      while (stack.length && m > 0) {
        m--;
        stack.pop();
      }
      return stack;
    },
  1
);

/**
 * @description Keep n items on the stack
 * @param {number} n
 * @returns {function}
 */
export const keepN =
  (n = 1) =>
  (...stack) =>
    stack.slice(0, n);

/**
 * @description Truncate the stack
 * @param {number} n
 * @param {number} index
 * @returns {function}
 */
export const trunc = attackStack((n = 1, index = 0) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  for (let i = 0; i < index; i++) {
    stack.pop();
  }
  return stack.splice(-n, Infinity);
});

/**
 * @description Keep the first half of the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const keepHalf = (...stack) =>
  stack.slice(0, Math.ceil(stack.length / 2));

/**
 * @description Drop the last half of the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const dropHalf = (...stack) =>
  stack.slice(0, Math.floor(stack.length / 2));

/**
 * @description Copy the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const copy = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const f = stack[0];
    return (...stack) => [
      ...stack,
      ...f.call(CALLING_STACK_FUNCTION, ...stack),
    ];
  }
  return [...stack, ...stack];
};
// export const dupe = attackStack(
//   (n) => collapseBinary(n, (a, b) => [b, a, a]),
//   2
// );
/**
 * @description Duplicate the last item on the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const dupe = (...stack) => {
  if (stack.length === 0) {
    return stack;
  }
  const last = stack.pop();
  return [...stack, last, last];
};

/**
 * @description Retrieve an item from the stack
 * @param {number} index
 * @returns {function}
 */
export const retrieve =
  (index = 0) =>
  (...stack) => {
    return [stack.at(~index)];
  };

/**
 * @description Compose a series of functions
 * @param {function} funcs
 * @returns {function[]}
 */
export const compose = (...funcs) => {
  return [
    (...stack) => {
      for (const fn of funcs) {
        stack = fn.call(CALLING_STACK_FUNCTION, ...stack);
      }
      return stack;
    },
  ];
};

/**
 * @description Peek at the last item on the stack
 * @param {any} args
 * @returns {any[]}
 */
export const peek = (...args) => {
  console.log(args[args.length - 1]);
  return args;
};

/**
 * @description View the entire stack
 * @param {any} args
 * @returns {any[]}
 */
export const view = (...args) => {
  console.log(...args);
  return args;
};

const cycleN =
  (n = 1) =>
  (...stack) => {
    if (n > 0) {
      for (let i = 0; i < n; i++) {
        stack.unshift(stack.pop());
      }
    } else {
      const m = -n;
      for (let i = 0; i < m; i++) {
        stack.push(stack.shift());
      }
    }
    return stack;
  };

/**
 * @description Cycle the stack
 * @param {number} n
 * @returns {function}
 */
export const cycle = attackStack((n = 1) => cycleN(n));

/**
 * @description Recycle the stack
 * @param {number} n
 * @returns {function}
 */
export const recycle = attackStack((n = 1) => cycleN(-n));

/**
 * @description Hold a function on the stack
 * @param {function} f
 * @returns {function}
 */
export const hold =
  (f) =>
  (...stack) =>
    [...stack, f];

/**
 * @description Seed the stack if it is empty
 * @param {any} seeds
 * @returns {function}
 */
export const seed =
  (...seeds) =>
  (...stack) =>
    stack.length ? stack : seeds;

/**
 * @description Join the stack into a string
 * @param {string} s
 * @returns {function}
 */
export const join =
  (s = " ") =>
  (...stack) =>
    [stack.join(s)];
//

/**
 * @description Sort the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const sort = function (...stack) {
  const sort_ascending = (a, b) => (a === b ? 0 : a > b ? -1 : 1);
  const sort_descending = (a, b) => (a === b ? 0 : a < b ? -1 : 1);

  if (this !== CALLING_STACK_FUNCTION) {
    const sorter = stack[0];
    return (...stack) =>
      stack.sort(
        sorter === true
          ? sort_ascending
          : sorter === false
          ? sort_descending
          : sorter
      );
  }
  return stack.sort(sort_ascending);
};

/**
 * @description Randomize the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const randomize = (...stack) => {
  const randomized = [...stack].sort(() => 0.5 - Math.random());
  return [...randomized];
};

/**
 * @description Concatenate strings
 * @param {number} n
 * @returns {function}
 */
export const strcat = attackStack(
  (n) => collapseBinary(n, (a, b) => [`${a}${b}`]),
  2
);

/**
 * @description Concatenate strings in sequence
 * @param {number} n
 * @returns {function}
 */
export const strseq = attackStack(
  (n) => collapseBinary(n, (a, b) => [`${b}${a}`]),
  2
);

/**
 * @description Decrement the last item on the stack
 * @param {number} a
 * @returns {number[]}
 */
export const dec = applyLastN(1)((a = 0) => [a - 1]);

/**
 * @description Increment the last item on the stack
 * @param {number} a
 * @returns {number[]}
 */
export const inc = applyLastN(1)((a = 0) => [a + 1]);

/**
 * @description Add the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const plus = attackStack((n) => collapseBinary(n, (a, b) => [a + b]), 2);

/**
 * @description Subtract the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const minus = attackStack(
  (n) => collapseBinary(n, (a, b) => [a - b]),
  2
);

/**
 * @description Multiply the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const times = attackStack(
  (n) => collapseBinary(n, (a, b) => [a * b]),
  2
);

/**
 * @description Divide the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const divide = attackStack(
  (n) => collapseBinary(n, (a, b) => [a / b]),
  2
);

/**
 * @description Exponentiate the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const exp = attackStack((n) => collapseBinary(n, (a, b) => [a ** b]), 2);

/**
 * @description Modulo the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const mod = attackStack(
  (n) => collapseBinary(n, (a = NaN, b = NaN) => [((a % b) + b) % b]),
  2
);

/**
 * @description Modulo the last two items on the stack
 * @param {number} n
 * @returns {function}
 */
export const modulus = attackStack(
  (n) => collapseBinary(n, (a, b) => [a % b]),
  2
);

/**
 * @description Sum the stack
 * @param {any} stack
 * @returns {number[]}
 */
export const sum = (...stack) => [stack.reduceRight((a, b) => a + b, 0)];

/**
 * @description Multiply the stack
 * @param {any} stack
 * @returns {number[]}
 */
export const product = (...stack) => [stack.reduceRight((a, b) => a * b, 1)];

/**
 * @description Map a function over the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const map = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const transformer = stack[0];
    return (...stack) => stack.map(transformer);
  }
  return stack.map((x) => x);
};

/**
 * @description Filter the stack with a predicate
 * @param {any} stack
 * @returns {any[]}
 */
export const filter = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const predicate = stack[0];
    return (...stack) => stack.filter(predicate);
  }
  return stack.filter((x) => x);
};

/**
 * @description Reduce the stack with a function
 * @param {any} stack
 * @returns {any[]}
 */
export const reduce = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const reducer = stack[0].bind(CALLING_STACK_FUNCTION);
    const init = stack[1];
    return (...stack) => [stack.reduce(reducer, init)];
  }
  const bin = stack.pop();
  while (stack.length > 1) {
    const a = stack.pop();
    const b = stack.pop();
    stack.push(...bin.call(CALLING_STACK_FUNCTION, a, b));
  }
  return stack;
};

/**
 * @description Check if the last two items on the stack are equal
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const equal = applyLastN(2)((a = NaN, b = NaN) => [a === b]);

/**
 * @description Check if the last two items on the stack are equal with coercion
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const coercedEqual = applyLastN(2)((a = NaN, b = NaN) => [a == b]);

/**
 * @description Compare the last two items on the stack
 * @param {any} a
 * @param {any} b
 * @returns {number[]}
 */
export const spaceship = applyLastN(2)((a = NaN, b = NaN) => [
  a === b ? 0 : a > b ? -1 : 1,
]);

/**
 * @description Check if the second to last item on the stack is less than the last item
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const lt = applyLastN(2)((a = NaN, b = NaN) => [a < b]);

/**
 * @description Check if the second to last item on the stack is less than or equal to the last item
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const lte = applyLastN(2)((a = NaN, b = NaN) => [a <= b]);

/**
 * @description Check if the second to last item on the stack is greater than the last item
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const gt = applyLastN(2)((a = NaN, b = NaN) => [a > b]);

/**
 * @description Check if the second to last item on the stack is greater than or equal to the last item
 * @param {any} a
 * @param {any} b
 * @returns {boolean[]}
 */
export const gte = applyLastN(2)((a = NaN, b = NaN) => [a >= b]);

/**
 * @description Count the number of items on the stack
 * @param {any} stack
 * @returns {number[]}
 */
export const count = (...stack) => {
  return [stack.length];
};

/**
 * @description Reverse the stack
 * @param {any} stack
 * @returns {any[]}
 */
export const reverse = (...stack) => stack.reverse();

/**
 * @description Collect the stack into an array
 * @param {any} stack
 * @returns {any[]}
 */
export const collect = function (...stack) {
  if (this === CALLING_STACK_FUNCTION) {
    return [stack];
  }
  const collection = stack[0] || [];
  return (...stack) => {
    if (collection instanceof Array) {
      for (const item of stack) {
        collection.push(item);
      }
    } else if (collection instanceof Set) {
      for (const item of stack) {
        collection.add(item);
      }
    } else if (collection instanceof Map) {
      for (const item of stack) {
        collection.set(item, item);
      }
    }
    return [collection];
  };
};

////////////////
// Execution
////////////////

/**
 * @description Execute a function
 * @param {any} a
 * @returns {any[]}
 */
export const execute = applyLastN(1)((a) => [processN()(...a)]);

// export const executeWait = applyLastN(1)((a) => [processN()(...a), wait]);
// export const executeWaitSpread = applyLastN(1)((a) => [
//   processN()(...a),
//   wait,
//   spread,
// ]);

// export const executeWait = applyLastN(1)(async (a) => [await processN()(...a)]);
// export const executeWaitSpread = applyLastN(1)(
//   async (a) => await processN()(...a)
// );

/**
 * @description Execute a function and wait for it to resolve
 * @param {any} stack
 * @returns {any[]}
 */
export const executeWait = (...stack) => wait(...execute(...stack));

/**
 * @description Execute a function, wait for it to resolve, and spread the result
 * @param {any} stack
 * @returns {any[]}
 */
export const executeWaitSpread = async (...stack) =>
  spread(...(await executeWait(...stack)));

////////////////
// Experimental
////////////////

/**
 * @description Step down from a number
 * @param {number} n
 * @returns {function}
 */
export const stepDown = (n = -Infinity) =>
  applyLastN(1)((a) => {
    if (a > n) {
      return [a, a - 1];
    }
    return [a];
  });

/**
 * @description Step up from a number
 * @param {number} n
 * @returns {function}
 */
export const stepUp = (n = Infinity) =>
  applyLastN(1)((a) => {
    if (a < n) {
      return [a, a + 1];
    }
    return [a];
  });

export const loops = {
  IMMUTABLE: (...stack) =>
    ["number", "string", "symbol"].indexOf(typeof stack[stack.length - 1]) ===
    -1,
  LARGE: (...stack) => {
    return stack[stack.length - 1] > 1;
  },
};

/**
 * @description Loop until a condition is met
 * @param {function} condition
 * @returns {function}
 */
export const loop = (condition = loops.IMMUTABLE) => {
  return (...stack) => {
    const func = stack.pop();

    if (typeof condition === "number") {
      for (let i = 0; i < condition; i++) {
        stack = func(...stack);
      }
    } else {
      while (condition(...stack)) {
        stack = func(...stack);
      }
    }

    return [...stack];
  };
};
