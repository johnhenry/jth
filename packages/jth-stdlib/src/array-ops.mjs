import { op, variadic } from "jth-runtime";
import { Stack } from "jth-runtime";

// push: push item onto array (bottom=arr, top=item)
export const push = op(2)((arr, item) => {
  if (Array.isArray(arr)) {
    arr.push(item);
    return [arr];
  }
  return [arr, item];
});

// pop: pop item from array
export const pop = op(1)((arr) => {
  if (Array.isArray(arr)) {
    const item = arr.pop();
    return [arr, item];
  }
  return [arr];
});

// shift: shift from array
export const shift = op(1)((arr) => {
  if (Array.isArray(arr)) {
    const item = arr.shift();
    return [arr, item];
  }
  return [arr];
});

// unshift: unshift onto array
export const unshift = op(2)((arr, item) => {
  if (Array.isArray(arr)) {
    arr.unshift(item);
    return [arr];
  }
  return [arr, item];
});

// suppose: add to collection (FIX BUG: old code had stack.pop without ())
export const suppose = op(2)((collection, item) => {
  if (Array.isArray(collection)) {
    collection.push(item);
    return [collection];
  }
  if (collection instanceof Set) {
    collection.add(item);
    return [collection];
  }
  if (collection instanceof Map) {
    collection.set(item, item);
    return [collection];
  }
  return [collection, item];
});

// array: collect top N items into array
export const array = (n = Infinity) => (stack) => {
  const arr =
    n === Infinity ? stack.toArray() : stack.popN(Math.min(n, stack.length));
  if (n === Infinity) stack.clear();
  stack.push(arr);
};

// flatten: flatten arrays
export const flatten = variadic((...args) => {
  const flat = [];
  const doFlat = (items) => {
    for (const item of items) {
      if (Array.isArray(item)) doFlat(item);
      else flat.push(item);
    }
  };
  doFlat(args);
  return flat;
});

// sort: sort the stack. Configurable: sort() = ascending, sort(false) = descending
export const sort =
  (ascending = true) =>
  (stack) => {
    const arr = stack.toArray();
    const cmp = ascending
      ? (a, b) => (a === b ? 0 : a < b ? -1 : 1)
      : (a, b) => (a === b ? 0 : a > b ? -1 : 1);
    arr.sort(cmp);
    stack.clear();
    stack.push(...arr);
  };

// randomize: shuffle the stack
export const randomize = (stack) => {
  const arr = stack.toArray();
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  stack.clear();
  stack.push(...arr);
};

// map: [array] #[ block ] map -- apply block to each element, return new array
// Block-aware: each element gets its own isolated Stack.
export const mapOp = (stack) => {
  const block = stack.pop();
  const arr = stack.pop();
  const result = [];
  for (const elem of arr) {
    const s = new Stack();
    s.push(elem);
    if (typeof block === "function") block(s);
    result.push(s.pop());
  }
  stack.push(result);
};

// filter: [array] #[ block ] filter -- keep elements where block returns truthy
// Block-aware: each element gets its own isolated Stack.
export const filterOp = (stack) => {
  const block = stack.pop();
  const arr = stack.pop();
  const result = [];
  for (const elem of arr) {
    const s = new Stack();
    s.push(elem);
    if (typeof block === "function") block(s);
    if (s.pop()) result.push(elem);
  }
  stack.push(result);
};

// reduce: [array] init #[ block ] reduce -- accumulate over array with block
// Block-aware: each iteration gets its own isolated Stack with [acc, element].
export const reduceOp = (stack) => {
  const block = stack.pop();
  const init = stack.pop();
  const arr = stack.pop();
  let acc = init;
  for (const elem of arr) {
    const s = new Stack();
    s.push(acc, elem);
    if (typeof block === "function") block(s);
    acc = s.pop();
  }
  stack.push(acc);
};

// fold: alias for reduce (catamorphism over flat arrays)
export const foldOp = reduceOp;

// bend: seed #[ predicate ] #[ step ] bend -- unfold/anamorphism
// Produces an array from a seed value.
// predicate: given seed, returns truthy to continue
// step: given seed, should leave [value, nextSeed] on stack
export const bendOp = (stack) => {
  const step = stack.pop();
  const predicate = stack.pop();
  let seed = stack.pop();
  const result = [];

  for (;;) {
    // Test predicate
    const ps = new Stack();
    ps.push(seed);
    if (typeof predicate === "function") predicate(ps);
    if (!ps.pop()) break;

    // Execute step
    const ss = new Stack();
    ss.push(seed);
    if (typeof step === "function") step(ss);
    const nextSeed = ss.pop();
    const value = ss.pop();
    result.push(value);
    seed = nextSeed;
  }

  stack.push(result);
};

// Legacy configurable versions (not registered, kept for internal use)
export const map = (fn) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.map(fn));
};

export const filter = (fn) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.filter(fn));
};

export const reduce = (fn, init) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(arr.reduce(fn, init));
};
