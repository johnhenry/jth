import { op, variadic } from "jth-runtime";

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

// map: { block } map -- apply block to each item
export const map = (fn) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.map(fn));
};

// filter: { predicate } filter -- keep items where predicate is truthy
export const filter = (fn) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.filter(fn));
};

// reduce: { reducer } init reduce
export const reduce = (fn, init) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(arr.reduce(fn, init));
};
