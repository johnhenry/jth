import { processN, CALLING_STACK_FUNCTION } from "./process-n.mjs";
import { applyLastN, attackStack, collapseBinary } from "./tools/index.mjs"; // jth-tools
export * from "./tools/index.mjs"; // jth-tools
export * from "./wrap.mjs";
export * from "./async/index.mjs";
export * from "./logic/index.mjs";

export const run = applyLastN(1)((a) => [processN()(...a)]);
export const noop = (...args) => args;
export const clear = function (guard) {
  if (this === CALLING_STACK_FUNCTION) {
    return [];
  }
  return (...stack) => (guard ? [] : stack);
};

export const forbidden =
  (...message) =>
  (...args) => {
    if (message.length) {
      console.log(...message);
    }
    return noop(...args);
  };

export const spread = applyLastN(1)((a) => a);
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

export const keepN =
  (n = 1) =>
  (...stack) =>
    stack.slice(0, n);

export const trunc = attackStack((n = 1, index = 0) => (...stack) => {
  if (!stack.length) {
    return stack;
  }
  for (let i = 0; i < index; i++) {
    stack.pop();
  }
  return stack.splice(-n, Infinity);
});

export const keepHalf = (...stack) =>
  stack.slice(0, Math.ceil(stack.length / 2));
export const dropHalf = (...stack) =>
  stack.slice(0, Math.floor(stack.length / 2));
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
export const dupe = attackStack(
  (n) => collapseBinary(n, (a, b) => [b, a, a]),
  2
);

export const retrieve =
  (index = 0) =>
  (...stack) => {
    return [stack.at(~index)];
  };

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
export const peek = (...args) => {
  console.log(args[args.length - 1]);
  return args;
};

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

export const cycle = attackStack((n = 1) => cycleN(n));
export const recycle = attackStack((n = 1) => cycleN(-n));

export const hold =
  (f) =>
  (...stack) =>
    [...stack, f];

export const seed =
  (...seeds) =>
  (...stack) =>
    stack.length ? stack : seeds;

export const join =
  (s = " ") =>
  (...stack) =>
    [stack.join(s)];
//

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
export const randomize = (...stack) => {
  const randomized = [...stack].sort(() => 0.5 - Math.random());
  return [...randomized];
};

export const strcat = attackStack(
  (n) => collapseBinary(n, (a, b) => [`${a}${b}`]),
  2
);

export const strseq = attackStack(
  (n) => collapseBinary(n, (a, b) => [`${b}${a}`]),
  2
);

export const dec = applyLastN(1)((a = 0) => [a - 1]);
export const inc = applyLastN(1)((a = 0) => [a + 1]);
export const plus = attackStack((n) => collapseBinary(n, (a, b) => [a + b]), 2);
export const minus = attackStack(
  (n) => collapseBinary(n, (a, b) => [a - b]),
  2
);
2 ** (2 ** 2);

export const times = attackStack(
  (n) => collapseBinary(n, (a, b) => [a * b]),
  2
);
export const divide = attackStack(
  (n) => collapseBinary(n, (a, b) => [a / b]),
  2
);
export const exp = attackStack((n) => collapseBinary(n, (a, b) => [a ** b]), 2);

export const mod = attackStack(
  (n) => collapseBinary(n, (a = NaN, b = NaN) => [((a % b) + b) % b]),
  2
);
export const modulus = attackStack(
  (n) => collapseBinary(n, (a, b) => [a % b]),
  2
);

export const sum = (...stack) => [stack.reduceRight((a, b) => a + b, 0)];
export const product = (...stack) => [stack.reduceRight((a, b) => a * b, 1)];

export const map = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const transformer = stack[0];
    return (...stack) => stack.map(transformer);
  }
  return stack.map((x) => x);
};
export const filter = function (...stack) {
  if (this !== CALLING_STACK_FUNCTION) {
    const predicate = stack[0];
    return (...stack) => stack.filter(predicate);
  }
  return stack.filter((x) => x);
};

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

export const equal = applyLastN(2)((a = NaN, b = NaN) => [a === b]);
export const coercedEqual = applyLastN(2)((a = NaN, b = NaN) => [a == b]);

export const spaceship = applyLastN(2)((a = NaN, b = NaN) => [
  a === b ? 0 : a > b ? -1 : 1,
]);
export const lt = applyLastN(2)((a = NaN, b = NaN) => [a < b]);
export const lte = applyLastN(2)((a = NaN, b = NaN) => [a <= b]);

export const gt = applyLastN(2)((a = NaN, b = NaN) => [a > b]);
export const gte = applyLastN(2)((a = NaN, b = NaN) => [a >= b]);

export const count = (...stack) => {
  return [stack.length];
};

export const reverse = (...stack) => stack.reverse();

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
// Experimental
////////////////

export const stepDown = (n = -Infinity) =>
  applyLastN(1)((a) => {
    if (a > n) {
      return [a, a - 1];
    }
    return [a];
  });

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
