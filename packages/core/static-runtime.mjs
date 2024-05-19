(function () {
  'use strict';

  /**
   * @description Extracts values from a dictionary and assigns them to the global object.
   * @example
   * ```javascript
   * const values = { a: 1, b: 2, c: 3};
   * extractGlobal(values);
   * console.log(a); // 1
   * console.log(b); // 2
   * console.log(c); // 3
   * ```
   * @param {Dict} values - The dictionary to extract values from
   * @param {Dict}
   *  - rename: Dict - A dictionary of keys to rename
   *  - target: Object - The object to assign the values to
   *  - allowDefault: boolean - Whether to allow the default key to be assigned
   * @returns
   * - number of entries
   */

  const extractGlobal = (
    values = {},
    { rename = {}, target = globalThis, allowDefault = false } = {
      rename: {},
      target: globalThis,
      allowDefault: false,
    }
  ) => {
    const entries = Object.entries(values);
    for (const [key, value] of entries) {
      if (allowDefault || key !== "default") {
        target[rename[key] || key] = value;
      }
    }
    return entries.length;
  };

  const META = Symbol.for("PROCESS_META");
  const CALLING_STACK_FUNCTION = Symbol.for("CALLING_STACK_FUNCTION");
  const unwrap = (_) => {
    let wrapped = {};
    if (typeof _ === "function" && _[META] !== undefined) {
      wrapped = _[META];
      _ = _();
    }
    return { _, ...wrapped };
  };

  const wrap = (f, vals = {}) => {
    const { _, ...wrapped } = unwrap(f);
    const fu = () => _;
    fu[META] = { ...wrapped, ...vals };
    return fu;
  };

  const processN =
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

  // import { CALLING_STACK_FUNCTION } from "../process-n.mjs";
  const EMPTY_ARGUMENT = Symbol("EMPTY_ARGUMENT");
  /**
   * @description Create stack function creates a function that applies last n arguments to a function
   * @param {*} n - Number of arguments to apply
   * @param {boolean} empty - Whether to apply empty arguments if stack is too short
   * @param {*} EMPTY - argument signifying empty argument
   * @returns {function}
   * |
   */
  const applyLastN =
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
  const attackStack = (stackattack, ...stackDefaults) =>
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

  const collapseBinary =
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

  const stackify = (
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

  const noop$1 = (...args) => args;

  const rewindN$1 =
    (n = 1) =>
    (f = noop$1) =>
      wrap(f, { rewind: n });

  const reset = rewindN$1(-1)();
  const back = rewindN$1()();

  const limitN =
    (n = -1) =>
    (f = noop$1) =>
      wrap(f, { limit: n });
  const delayN =
    (n = 1) =>
    (f = noop$1) =>
      wrap(f, { delay: n });
  const pause = delayN();

  const persistN =
    (n = Infinity) =>
    (f = noop$1) =>
      wrap(f, { persist: n });

  const skipN =
    (n = 1) =>
    (f = noop$1) =>
      wrap(f, { skip: n });

  const wrapify = (f) => {
    f.rewind = (n = 1) => rewindN$1(n)(f);
    f.limit = (n = 0) => limitN(n)(f);
    f.delay = (n = 1) => delayN(n)(f);
    f.persist = (n = Infinity) => persistN(n)(f);
    f.skip = (n = 1) => skipN(n)(f);
    return f;
  };
  const swap = (...stack) => {
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

  const wait = async (...stack) => {
    const last = stack.pop();
    return [...stack, await last];
  };

  const waitAll = async (...stack) => {
    return Promise.all(stack);
  };

  const run = applyLastN(1)((a) => [processN()(...a)]);
  const noop = (...args) => args;
  const clear$1 = function (guard) {
    if (this === CALLING_STACK_FUNCTION) {
      return [];
    }
    return (...stack) => (guard ? [] : stack);
  };

  const forbidden =
    (...message) =>
    (...args) => {
      if (message.length) {
        console.log(...message);
      }
      return noop(...args);
    };

  const spread = applyLastN(1)((a) => a);
  const drop = attackStack(
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

  const keepN =
    (n = 1) =>
    (...stack) =>
      stack.slice(0, n);

  const trunc = attackStack((n = 1, index = 0) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    for (let i = 0; i < index; i++) {
      stack.pop();
    }
    return stack.splice(-n, Infinity);
  });

  const keepHalf = (...stack) =>
    stack.slice(0, Math.ceil(stack.length / 2));
  const dropHalf = (...stack) =>
    stack.slice(0, Math.floor(stack.length / 2));
  const copy = function (...stack) {
    if (this !== CALLING_STACK_FUNCTION) {
      const f = stack[0];
      return (...stack) => [
        ...stack,
        ...f.call(CALLING_STACK_FUNCTION, ...stack),
      ];
    }
    return [...stack, ...stack];
  };
  const dupe = attackStack(
    (n) => collapseBinary(n, (a, b) => [b, a, a]),
    2
  );

  const retrieve =
    (index = 0) =>
    (...stack) => {
      return [stack.at(~index)];
    };

  const compose = (...funcs) => {
    return [
      (...stack) => {
        for (const fn of funcs) {
          stack = fn.call(CALLING_STACK_FUNCTION, ...stack);
        }
        return stack;
      },
    ];
  };
  const peek = (...args) => {
    console.log(args[args.length - 1]);
    return args;
  };

  const view = (...args) => {
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

  const cycle = attackStack((n = 1) => cycleN(n));
  const recycle = attackStack((n = 1) => cycleN(-n));

  const hold =
    (f) =>
    (...stack) =>
      [...stack, f];

  const seed =
    (...seeds) =>
    (...stack) =>
      stack.length ? stack : seeds;

  const join =
    (s = " ") =>
    (...stack) =>
      [stack.join(s)];
  //

  const sort$1 = function (...stack) {
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
  const randomize = (...stack) => {
    const randomized = [...stack].sort(() => 0.5 - Math.random());
    return [...randomized];
  };

  const strcat = attackStack(
    (n) => collapseBinary(n, (a, b) => [`${a}${b}`]),
    2
  );

  const strseq = attackStack(
    (n) => collapseBinary(n, (a, b) => [`${b}${a}`]),
    2
  );

  const dec = applyLastN(1)((a = 0) => [a - 1]);
  const inc = applyLastN(1)((a = 0) => [a + 1]);
  const plus = attackStack((n) => collapseBinary(n, (a, b) => [a + b]), 2);
  const minus = attackStack(
    (n) => collapseBinary(n, (a, b) => [a - b]),
    2
  );

  const times = attackStack(
    (n) => collapseBinary(n, (a, b) => [a * b]),
    2
  );
  const divide = attackStack(
    (n) => collapseBinary(n, (a, b) => [a / b]),
    2
  );
  const exp = attackStack((n) => collapseBinary(n, (a, b) => [a ** b]), 2);

  const mod = attackStack(
    (n) => collapseBinary(n, (a = NaN, b = NaN) => [((a % b) + b) % b]),
    2
  );
  const modulus = attackStack(
    (n) => collapseBinary(n, (a, b) => [a % b]),
    2
  );

  const sum = (...stack) => [stack.reduceRight((a, b) => a + b, 0)];
  const product = (...stack) => [stack.reduceRight((a, b) => a * b, 1)];

  const map = function (...stack) {
    if (this !== CALLING_STACK_FUNCTION) {
      const transformer = stack[0];
      return (...stack) => stack.map(transformer);
    }
    return stack.map((x) => x);
  };
  const filter = function (...stack) {
    if (this !== CALLING_STACK_FUNCTION) {
      const predicate = stack[0];
      return (...stack) => stack.filter(predicate);
    }
    return stack.filter((x) => x);
  };

  const reduce = function (...stack) {
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

  const equal = applyLastN(2)((a = NaN, b = NaN) => [a === b]);
  const coercedEqual = applyLastN(2)((a = NaN, b = NaN) => [a == b]);

  const spaceship = applyLastN(2)((a = NaN, b = NaN) => [
    a === b ? 0 : a > b ? -1 : 1,
  ]);
  const lt = applyLastN(2)((a = NaN, b = NaN) => [a < b]);
  const lte = applyLastN(2)((a = NaN, b = NaN) => [a <= b]);

  const gt = applyLastN(2)((a = NaN, b = NaN) => [a > b]);
  const gte = applyLastN(2)((a = NaN, b = NaN) => [a >= b]);

  const count = (...stack) => {
    return [stack.length];
  };

  const reverse = (...stack) => stack.reverse();

  const collect = function (...stack) {
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

  const stepDown = (n = -Infinity) =>
    applyLastN(1)((a) => {
      if (a > n) {
        return [a, a - 1];
      }
      return [a];
    });

  const stepUp = (n = Infinity) =>
    applyLastN(1)((a) => {
      if (a < n) {
        return [a, a + 1];
      }
      return [a];
    });

  const loops = {
    IMMUTABLE: (...stack) =>
      ["number", "string", "symbol"].indexOf(typeof stack[stack.length - 1]) ===
      -1,
    LARGE: (...stack) => {
      return stack[stack.length - 1] > 1;
    },
  };

  const loop = (condition = loops.IMMUTABLE) => {
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

  const staticOperators = {};
  const dynamicOperators = new Map();
  /**
   * @description Set an operator
   * @param {string|RegExp} k - The operator to set
   * @param {function} v - The function to set
   * @returns {void}
   * @example
   * ```javascript
   * set("foo", () => "bar");
   * operators("foo"); // () => "bar"
   * ```
   */

  const set$1 = (k, v) => {
    typeof k !== "string" ? dynamicOperators.set(k, v) : (staticOperators[k] = v);
  };
  const setObj = (obj) => {
    for (const [k, v] of obj instanceof Map ? obj : Object.entries(obj)) {
      set$1(k, v);
    }
  };
  const operators = (o) => {
    if (staticOperators[o]) {
      return staticOperators[o];
    }
    for (const [match, func] of dynamicOperators) {
      if (match.test(o)) {
        return func(o, match);
      }
    }
  };

  setObj({
    "@": peek,
    "@@": view,
    "∅": noop,
    "+": plus,
    "-": minus,
    "*": times,
    "**": exp,
    "/": divide,
    "=": equal,
    "==": coercedEqual,
    "++": inc,
    "--": dec,
    "...": spread,
    $: run,
    "<": gt,
    "<=": gte,
    ">": lt,
    ">=": lte,
    "<=>": spaceship,
    "%": mod,
    "%%": modulus,
    "<<-": rewindN$1(Infinity)(),
    "->>": skipN(Infinity)(),
    Σ: sum,
    Π: product,
    _: wait,
    __: waitAll,
    and: copy,
    or: copy,
    not: copy,
  });

  // Incrementors
  // Examples: -1/, 14+, 32*, 3.414/ ...
  const defaultDynamicOperators = new Map();
  defaultDynamicOperators.set(
    /^([+-]?(?:\d*\.)?\d+)(n?)([+-\\*\\/\%])$/,
    (o, r) => {
      const [, num, bigint, op] = r.exec(o);
      const n = bigint ? BigInt(num) : Number(num);
      switch (op) {
        case "+":
          // Examples: 1+, 14+, -32+, 3.414+ ...
          return applyLastN(1)((a = 0) => [n + a]);
        case "-":
          // Examples: 1-, 14-, -32*, 3.414- ...
          return applyLastN(1)((a = 0) => [n - a]);
        case "*":
          // Examples: 1*, 14*, -32*, 3.414* ...
          return applyLastN(1)((a = 1) => [n * a]);
        case "/":
          // Examples: 1/, 14/, -32/, 3.414/ ...
          return applyLastN(1)((a = 1) => [n / a]);
        case "%":
          // Examples: 1%, 14%, -32%, 3% ...
          return applyLastN(1)((a = 1) => [((n % a) + a) % a]);
      }
    }
  );

  // Skip
  // Examples: ->, ->2, ->3 ...
  defaultDynamicOperators.set(/^->(\d?)$/, (o, r) => {
    const [, num] = r.exec(o);
    if (num) {
      return skipN(Number(num))();
    }
    return skipN(1)();
  });
  // Rewind
  // Examples: <-, 2<-, 3<- ...
  defaultDynamicOperators.set(/^(\d?)<-$/, (o, r) => {
    const [, num] = r.exec(o);
    if (num) {
      return rewindN$1(Number(num))();
    }
    return rewindN$1(1)();
  });

  setObj(defaultDynamicOperators);

  const sort = (...stack) => stack.sort();

  const mean = (...stack) => {
    return [stack.reduceRight((a, b) => a + b, 0) / stack.length];
  };
  const median = (...stack) => {
    const values = sort(...stack);
    const half = Math.floor(values.length / 2);
    if (values.length % 2) {
      return [values[half]];
    }
    return [(values[half - 1] + values[half]) / 2];
  };

  const mode = (...stack) => {
    const counts = new Map();
    let max = 0;
    for (const item of stack) {
      const value = counts.get(item) || 0;
      counts.set(item, value + 1);
      if (value === max) {
        max++;
      }
    }
    return [[...counts].find(([, value]) => value === max)[0]];
  };
  const modes = (...stack) => {
    const counts = new Map();
    let max = 0;
    for (const item of stack) {
      const value = counts.get(item) || 0;
      counts.set(item, value + 1);
      if (value === max) {
        max++;
      }
    }
    const result = [...counts]
      .filter(([, value]) => value === max)
      .map(([key]) => key);
    return [...result, result.length];
  };

  const populationVariance = (...stack) => {
    const n = stack.length;
    if (n < 1) {
      throw new Error("stack length must be greater than 0");
    }
    const [m] = mean(...stack);
    return [
      stack.map((x) => Math.pow(x - m, 2)).reduceRight((a, b) => a + b) / n,
    ];
  };
  const sampleVariance = (...stack) => {
    const n = stack.length;
    if (n < 2) {
      throw new Error("stack length must be greater than 1");
    }
    const [m] = mean(...stack);
    return [
      stack.map((x) => Math.pow(x - m, 2)).reduceRight((a, b) => a + b) / (n - 1),
    ];
  };

  const populationStandardDeviation = (...stack) => {
    return [Math.sqrt(populationVariance$(stack)[0])];
  };
  const sampleStandardDeviation = (...stack) => {
    return [Math.sqrt(sampleVariance$(stack)[0])];
  };

  const percentile =
    (d) =>
    (...stack) => {
      const index = d * (stack.length - 1);
      if (Number.isInteger(index)) {
        return [stack[index]];
      } else {
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        return [(stack[lower] + stack[upper]) / 2];
      }
    };

  const fiveNumberSummary = (...stack) => {
    const values = sort(...stack);
    const [m] = mean(...stack);
    const [lower, upper] = [values[0], values[values.length - 1]];
    const [q1] = percentile(0.25)(...values);
    const [q3] = percentile(0.75)(...values);
    return [lower, q1, m, q3, upper];
  };

  const fiveNumberSummaryB = (...stack) => {
    const values = sort(...stack);
    const [m] = mean(...stack);
    const [q1] = percentile(0.25)(...values);
    const [q3] = percentile(0.75)(...values);
    const iqr = q3 - q1;
    const [min, max] = [q1 - 1.5 * iqr, q3 + 1.5 * iqr];
    return [...stack, min, q1, m, q3, max];
  };

  /**
   * @category StackFunction
   * @description If penultimate element of stack is an array, push the last element onto it's end
   * @param {(array|any)?} - Penultimate element of stack
   * @param {any?} - Last element of stack
   * @returns {[array|any?]} - Modified stack
   * @example
   * ```javascript
   * const newStack = push([[4, 5], 6]);
   * console.log(newStack); // [[4, 5, 6]]
   * ```
   */
  const push = attackStack((index = 0, n = 1) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    while (stack.length) {
      const thing = stack.pop();
      if (Array.isArray(thing)) {
        thing.push(...spare.splice(-n, Infinity));
        spare.unshift(thing);
        break;
      } else {
        spare.unshift(thing);
      }
    }
    return [...stack, ...spare];
  });
  /**
   * @category StackFunction
   * @description If penultimate element of stack is an array, unshift the last element onto it's beginning
   * @param {(array|any)?} - Penultimate element of stack
   * @param {any?} - Last element of stack
   * @returns {[array|any?]} - Modified stack
   * @example
   * ```javascript
   * const newStack = unshift([[4, 5], 6]);
   * console.log(newStack); // [[6, 4, 5]]
   * ```
   */
  const unshift = attackStack((index = 0, n = 1) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    while (stack.length) {
      const thing = stack.pop();
      if (Array.isArray(thing)) {
        thing.unshift(...spare.splice(-n, Infinity));
        spare.unshift(thing);
        break;
      } else {
        spare.unshift(thing);
      }
    }
    return [...stack, ...spare];
  });
  /**
   * @category StackFunction
   * @description If last element of stack is an array, pop the last element off of it
   * and push it onto the stack
   * @param {(array|any)?} - Last element of stack
   * @returns {[array|any?]} - Modified stack
   * @example
   * ```javascript
   * const newStack = pop([4, 5, 6]);
   * console.log(newStack); // [[4, 5], 6]
   * ```
   */
  const pop = attackStack((index = 0, n = 1) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    while (stack.length) {
      const thing = stack.pop();
      if (Array.isArray(thing)) {
        stack.push(thing);
        const items = [];
        for (let i = 0; i < n; i++) {
          if (thing.length) {
            items.push(thing.pop());
          }
        }
        return [...stack, ...spare, ...items];
      } else {
        spare.unshift(thing);
      }
    }
    return [...stack, ...spare];
  });

  /**
   * @category StackFunction
   * If last element of stack is an array, shift the first element off of it
   * and push it onto the stack
   * @param {(array|any)?} - Last element of stack
   * @returns {[array|any?]} - Modified stack
   * @example
   * ```javascript
   * const newStack = shift([4, 5, 6]);
   * console.log(newStack); // [[5, 6], 4]
   * ```
   */
  const shift = attackStack((index = 0, n = 1) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    while (stack.length) {
      const thing = stack.pop();
      if (Array.isArray(thing)) {
        stack.push(thing);
        const items = [];
        for (let i = 0; i < n; i++) {
          if (thing.length) {
            items.push(thing.shift());
          }
        }
        return [...stack, ...spare, ...items];
      } else {
        spare.unshift(thing);
      }
    }
    return [...stack, ...spare];
  });

  /**
   * @category StackFunction
   * If penultimate element of stack is an array, set, or map add the last element of the stack to it
   * @param {(array|set|map)?} - Penultimate element of stack
   * @param {any?} - Last element of stack
   * @returns {[array|set|map?]} - Modified stack
   * @example array
   * ```javascript
   * const newStack = suppose([4, 5], 6);
   * console.log(newStack); // [[4, 5, 6]]
   * ```
   * @example set
   * ```javascript
   * const newStack = suppose(new Set([4, 5]), 6);
   * console.log(newStack); // [Set(3) { 4, 5, 6 }]
   * ```
   * @example map
   * ```
   * const newStack = suppose(new Map([["a", 1], ["b", 2]]), ["c", 3]);
   * console.log(newStack); // [Map(3) { 'a' => 1, 'b' => 2, 'c' => 3 }]
   * ```
   */
  const suppose = attackStack((index = 0, n = 1) => (...stack) => {
    if (!stack.length) {
      return stack;
    }
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    const arr = stack.pop();

    for (let i = 0; i < n; i++) {
      if (stack.length) {
        if (Array.isArray(arr)) {
          arr.unshift(stack.pop());
        } else if (arr instanceof Set) {
          arr.add(stack.pop());
        } else if (arr instanceof Map) {
          // Should I extract a key and value from the item?
          // I don't know if it makes sense
          // to attempt to susppose a map at all.
          const item = stack.pop;
          arr.set(item, item);
        }
      }
    }
    return [...stack, arr, ...spare];
  });

  /**
   * @category StackFunction
   * If last element of stack is an array, pop the last element off of it
   */
  const next = applyLastN(1)((obj) => {
    if (!obj?.next) {
      return [obj];
    }
    const { done, value } = obj.next();
    if (done) {
      return [obj];
    }
    return [obj, value];
  });
  const drain = attackStack((index = 0, n = 1) => (...stack) => {
    const spare = [];
    for (let i = 0; i < index; i++) {
      spare.push(stack.pop());
    }
    const obj = stack.pop();
    if (Array.isArray(obj)) {
      for (let i = 0; i < n; i++) {
        if (!obj.length) {
          return stack;
        }
        stack.push(obj.shift());
      }
      return [...stack, obj, ...spare];
    }
    if (obj.next) {
      for (let i = 0; i < n; i++) {
        const { done, value } = obj.next();
        if (done) {
          return stack;
        }
        stack.push(value);
      }
      return [...stack, obj, ...spare];
    }
    return [obj];
  });
  const iter = (...stack) => {
    const a = stack[stack.length - 1];
    if (typeof a[Symbol.iterator] === "function") {
      return [a[Symbol.iterator]()];
    }
    return stack;
  };

  const numStack = (...stack) => {
    const end = stack.pop();
    const start = stack.pop();
    const ascending = end > start;
    return {
      start,
      end,
      ascending,
      stack,
    };
  };

  const numProc = (nums, ascending, start, end) => {
    if (ascending) {
      for (let i = start; i <= end; i++) {
        nums.push(i);
      }
    } else {
      for (let i = start; i >= end; i--) {
        nums.push(i);
      }
    }
    return nums;
  };

  // 5 8 to @!!; 6 7
  const to = (...stack) => {
    const { start, end, ascending, stack: nums } = numStack(...stack);
    return [
      ...numProc(
        nums,
        ascending,
        ascending ? start + 1 : start - 1,
        ascending ? end - 1 : end + 1
      ),
    ];
  };
  // 5 8 fromTo @!!; 5 6 7
  const fromTo = (...stack) => {
    const { start, end, ascending, stack: nums } = numStack(...stack);
    return [...numProc(nums, ascending, start, ascending ? end - 1 : end + 1)];
  };
  // 5 8 toInc  @!!; 6 7 8

  const toInc = (...stack) => {
    const { start, end, ascending, stack: nums } = numStack(...stack);
    return [...numProc(nums, ascending, ascending ? start + 1 : start - 1, end)];
  };
  // 5 8 fromToInc @!!; 5 6 7 8

  const fromToInc = (...stack) => {
    const { start, end, ascending, stack: nums } = numStack(...stack);
    return [...numProc(nums, ascending, start, end)];
  };

  const and = attackStack((n) => collapseBinary(n, (a, b) => [a && b]), 2);

  const or = attackStack((n) => collapseBinary(n, (a, b) => [a || b]), 2);

  const not = (...stack) => {
    const item = !stack.pop();
    return [...stack, item];
  };

  ////////////////
  // Experimental
  ////////////////
  const when =
    (condition = true) =>
    (...stack) => {
      if (typeof condition === "function" ? condition(...stack) : condition) {
        return stack;
      }
      stack.pop();
      return stack;
    };

  const dropWhen =
    (condition = true) =>
    (...stack) => {
      if (typeof condition === "function" ? condition(...stack) : condition) {
        stack.pop();
        return stack;
      }
      stack.pop();
      return stack;
    };

  const whenever =
    (condition, ...pre) =>
    (...stack) => {
      while (condition(...stack)) {
        stack = pre(...stack);
      }
      return stack;
    };

  const wheneverRepeat =
    (condition, ...pre) =>
    (...stack) => {
      if (condition(...stack)) {
        return [
          ...stack,
          ...pre,
          wheneverRepeat(condition, ...pre),
          rewindN(2)(),
        ];
      }
      return [...stack];
    };

  /*
  1 persistN()(sum) whenever((...stack)=>stack.length < 6, [rewindN(2)()], [drop])
  1 wheneverRepeat((...stack)=>stack.length < 6, sum)

  1 whenever((...stack)=>stack.length < 6, sum);
  */

  const keepIf = applyLastN(2)((condition, affirmative) =>
    condition ? [affirmative] : []
  );

  const dropIf = applyLastN(2)((condition, affirmative) =>
    condition ? [] : [affirmative]
  );
  const keepIfElse = applyLastN(3)((condition, affirmative, negative) =>
    condition ? [affirmative] : [negative]
  );

  const dropIfElse = applyLastN(3)((condition, affirmative, negative) =>
    condition ? [negative] : [affirmative]
  );

  setObj({
    "||": or,
    "&&": and,
    "!!": not,
  });

  const fibonacci = applyLastN(2)((a, b) => [b, a, b + a]);

  //https://github.com/qntm/hyperoperate/edit/main/src/index.js
  // also interesting: https://naruyoko.github.io/ExpantaNum.js/explanation.html
  // All arguments must be BigInts. Return value is a BigInt or a thrown RangeError

  const bigH = (n, a, b) => {
    if (n < 0n || a < 0n || b < 0n) {
      throw Error("Can only hyperoperate on non-negative integers");
    }

    // successor operator
    if (n === 0n) {
      // Ignore `b`
      return a + 1n;
    }

    // addition
    if (n === 1n) {
      return a + b;
    }

    // multiplication
    if (n === 2n) {
      return a * b;
    }

    // exponentiation
    if (n === 3n) {
      return a ** b;
    }

    // n >= 4, time for some handy base cases

    if (a === 0n) {
      // Fun fact:
      return b % 2n === 0n ? 1n : 0n;
    }

    if (a === 1n) {
      // 1^...^b = 1 for all finite b
      return 1n;
    }

    // a >= 2

    if (b === 0n) {
      // a^0 = 1 for all a >= 2
      return 1n;
    }

    if (b === 1n) {
      // a^...^1 = a for all a >= 2
      return a;
    }

    // b >= 2

    if (a === 2n && b === 2n) {
      // Another fun fact
      return 4n;
    }

    let result = a;
    for (let i = 1n; i < b; i++) {
      // This can cause a stack explosion... unavoidable because hyperoperation is not primitive recursive
      result = bigH(n - 1n, a, result);
    }

    return result;
  };

  /*
   * @description  Performs a hyperoperation on two numbers
   * @param {BigInt} n - The hyperoperation to perform
   * @param {BigInt} a - The first argument
   * @param {BigInt} b - The second argument
   * @returns {BigInt} - The result of the hyperoperation
   * @throws {RangeError} - If any argument is negative
   * @throws {RangeError} - If the result is too large to be represented as a BigInt
   * @throws {RangeError} - If the result causes a stack overflow
   * @throws {Error} - If any argument is negative
   * @throws {Error} - If any argument if all three areguments are not of the same type (BigInts or numbers)
   * @example
   * ```javascript
   * hyperoperation(0n)(1n, 2n); // 2n
   * ```
   *
   */

  const hyperoperation =
    (n) =>
    (a, b = 0n) => {
      if ([n, a, b].every((arg) => typeof arg === "bigint")) {
        return bigH(n, a, b);
      }

      if ([n, a, b].every((arg) => Number.isInteger(arg))) {
        // All plain doubles... convert inputs to `BigInt`s, then convert the result back to a double
        try {
          return Number(bigH(BigInt(n), BigInt(a), BigInt(b)));
        } catch (error) {
          // Not clear what other error could be thrown at this stage?
          /* istanbul ignore if */
          if (
            !(
              (
                error instanceof RangeError &&
                (error.message.includes("BigInt") || // BigInt overflow
                  error.message.includes("stack"))
              ) // stack overflow
            )
          ) {
            throw error;
          }
        }

        return Infinity;
      }
      if ([a, b].every((arg) => typeof arg === "bigint")) {
        try {
          return bigH(BigInt(n), a, b);
        } catch (error) {
          // Not clear what other error could be thrown at this stage?
          /* istanbul ignore if */
          if (
            !(
              (
                error instanceof RangeError &&
                (error.message.includes("BigInt") || // BigInt overflow
                  error.message.includes("stack"))
              ) // stack overflow
            )
          ) {
            throw error;
          }
        }

        return Infinity;
      }
      if ([a, b].every((arg) => typeof arg === "number")) {
        try {
          return Number(bigH(n, BigInt(a), BigInt(b)));
        } catch (error) {
          // Not clear what other error could be thrown at this stage?
          /* istanbul ignore if */
          if (
            !(
              (
                error instanceof RangeError &&
                (error.message.includes("BigInt") || // BigInt overflow
                  error.message.includes("stack"))
              ) // stack overflow
            )
          ) {
            throw error;
          }
        }
        return Infinity;
      }

      throw Error("Can only hyperoperate on three numbers or three BigInts");
    };

  // Set hyperoperation as dynamic operator
  // Examples: ***, ****, ***** ...
  set$1(/^[*]{3,}$/, (o) => {
    const h = hyperoperation(o.length + 1);
    return attackStack((n) => collapseBinary(n, (a, b) => [h(a, b)]));
  });

  const getString =
    (key, bind) =>
    (...stack) => {
      const member = stack.pop();
      return [
        ...stack,
        bind && typeof member[key] === "function"
          ? member[key].bind(object)
          : member[key],
      ];
    };

  const getList =
    (keys, bind) =>
    (...stack) => {
      const member = stack.pop();
      const object = {};
      for (const key of keys) {
        object[key] =
          bind && typeof member[key] === "function"
            ? member[key].bind(object)
            : member[key];
      }
      return [...stack, object];
    };

  const getAll =
    (bind) =>
    (...stack) => {
      const member = stack.pop();
      const object = {};
      for (const key in member) {
        object[key] =
          bind && typeof member[key] === "function"
            ? member[key].bind(object)
            : member[key];
      }
      return [...stack, object];
    };

  const get = (key, bind) => {
    if (key === undefined) {
      return getAll(bind);
    }
    if (typeof key === "string") {
      return getString(key, bind);
    } else {
      return getList(key, bind);
    }
  };

  const set = (...assingments) => {
    const entries = [];
    while (assingments.length > 1) {
      entries.push([assingments.shift(), assingments.shift()]);
    }
    const bind = assingments.length ? assingments.pop() : {};
    return (...stack) => {
      const target = stack.length > 0 ? Object.assign(stack.pop(), bind) : bind;
      for (const [key, value] of entries) {
        target[key] = value;
      }
      return [...stack, target];
    };
  };

  var context = /*#__PURE__*/Object.freeze({
    __proto__: null,
    operators: operators,
    META: META,
    CALLING_STACK_FUNCTION: CALLING_STACK_FUNCTION,
    unwrap: unwrap,
    wrap: wrap,
    processN: processN,
    EMPTY_ARGUMENT: EMPTY_ARGUMENT,
    applyLastN: applyLastN,
    attackStack: attackStack,
    collapseBinary: collapseBinary,
    stackify: stackify,
    noop: noop,
    rewindN: rewindN$1,
    reset: reset,
    back: back,
    limitN: limitN,
    delayN: delayN,
    pause: pause,
    persistN: persistN,
    skipN: skipN,
    wrapify: wrapify,
    swap: swap,
    wait: wait,
    waitAll: waitAll,
    run: run,
    clear: clear$1,
    forbidden: forbidden,
    spread: spread,
    drop: drop,
    keepN: keepN,
    trunc: trunc,
    keepHalf: keepHalf,
    dropHalf: dropHalf,
    copy: copy,
    dupe: dupe,
    retrieve: retrieve,
    compose: compose,
    peek: peek,
    view: view,
    cycle: cycle,
    recycle: recycle,
    hold: hold,
    seed: seed,
    join: join,
    sort: sort$1,
    randomize: randomize,
    strcat: strcat,
    strseq: strseq,
    dec: dec,
    inc: inc,
    plus: plus,
    minus: minus,
    times: times,
    divide: divide,
    exp: exp,
    mod: mod,
    modulus: modulus,
    sum: sum,
    product: product,
    map: map,
    filter: filter,
    reduce: reduce,
    equal: equal,
    coercedEqual: coercedEqual,
    spaceship: spaceship,
    lt: lt,
    lte: lte,
    gt: gt,
    gte: gte,
    count: count,
    reverse: reverse,
    collect: collect,
    stepDown: stepDown,
    stepUp: stepUp,
    loops: loops,
    loop: loop,
    mean: mean,
    median: median,
    mode: mode,
    modes: modes,
    populationVariance: populationVariance,
    sampleVariance: sampleVariance,
    populationStandardDeviation: populationStandardDeviation,
    sampleStandardDeviation: sampleStandardDeviation,
    percentile: percentile,
    fiveNumberSummary: fiveNumberSummary,
    fiveNumberSummaryB: fiveNumberSummaryB,
    push: push,
    unshift: unshift,
    pop: pop,
    shift: shift,
    suppose: suppose,
    next: next,
    drain: drain,
    iter: iter,
    to: to,
    fromTo: fromTo,
    toInc: toInc,
    fromToInc: fromToInc,
    and: and,
    or: or,
    not: not,
    when: when,
    dropWhen: dropWhen,
    whenever: whenever,
    wheneverRepeat: wheneverRepeat,
    keepIf: keepIf,
    dropIf: dropIf,
    keepIfElse: keepIfElse,
    dropIfElse: dropIfElse,
    fibonacci: fibonacci,
    get: get,
    set: set
  });

  extractGlobal(context);

})();
