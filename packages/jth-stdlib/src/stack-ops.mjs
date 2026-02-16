import { op, variadic } from "jth-runtime";

// noop: do nothing
export const noop = op(0)(() => []);

// clear: remove all items
export const clear = (stack) => {
  stack.clear();
};

// spread: pop array, push its elements
export const spread = op(1)((a) => (Array.isArray(a) ? a : [a]));

// drop: pop and discard top item
export const drop = op(1)(() => []);

// keepN: configured -- keepN(3) keeps only bottom 3
export const keepN = (n) => (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.slice(0, n));
};

// keepHalf: keep first half
export const keepHalf = (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.slice(0, Math.ceil(arr.length / 2)));
};

// dropHalf: drop second half
export const dropHalf = (stack) => {
  const arr = stack.toArray();
  stack.clear();
  stack.push(...arr.slice(0, Math.floor(arr.length / 2)));
};

// copy: duplicate entire stack
export const copy = (stack) => {
  const arr = stack.toArray();
  stack.push(...arr);
};

// dupe: duplicate top item
export const dupe = (stack) => {
  stack.dup();
};

// retrieve: configured -- retrieve(0) gets top, retrieve(1) gets second from top
export const retrieve = (index = 0) => (stack) => {
  const arr = stack.toArray();
  const val = arr[arr.length - 1 - index];
  stack.clear();
  stack.push(val);
};

// dig: configured -- dig(n) pulls nth item to top
export const dig = (n = 1) => (stack) => {
  const arr = stack.toArray();
  if (arr.length < 2) return;
  const idx = n < 0 ? ~n : arr.length + ~n;
  if (idx >= 0 && idx < arr.length) {
    const [item] = arr.splice(idx, 1);
    arr.push(item);
    stack.clear();
    stack.push(...arr);
  }
};

// bury: opposite of dig -- move top item n positions down
export const bury = (n = 1) => (stack) => {
  const arr = stack.toArray();
  if (arr.length < 2) return;
  const idx = n < 0 ? ~n : arr.length + ~n;
  if (idx >= 0 && idx < arr.length) {
    const item = arr.pop();
    arr.splice(idx, 0, item);
    stack.clear();
    stack.push(...arr);
  }
};

// cycle: rotate stack -- move top to bottom
export const cycle = (n = 1) => (stack) => {
  const arr = stack.toArray();
  for (let i = 0; i < n; i++) arr.unshift(arr.pop());
  stack.clear();
  stack.push(...arr);
};

// recycle: opposite cycle -- move bottom to top
export const recycle = (n = 1) => (stack) => {
  const arr = stack.toArray();
  for (let i = 0; i < n; i++) arr.push(arr.shift());
  stack.clear();
  stack.push(...arr);
};

// swap: swap top two items
export const swap = (stack) => {
  stack.swap();
};

// hold: push a function as a value (not execute)
export const hold = (f) => (stack) => {
  stack.push(f);
};

// seed: push values if stack is empty
export const seed =
  (...seeds) =>
  (stack) => {
    if (stack.isEmpty()) stack.push(...seeds);
  };

// reverse: reverse the entire stack
export const reverse = (stack) => {
  const arr = stack.toArray().reverse();
  stack.clear();
  stack.push(...arr);
};

// count: push the length of the stack (non-destructive)
export const count = (stack) => {
  stack.push(stack.length);
};

// collect: consume entire stack into a single array
export const collect = variadic((...args) => [args]);

// peek: console.log top item, don't consume (replaces @)
export const peek = (stack) => {
  console.log(stack.peek());
};

// peekAll: console.log entire stack, don't consume (replaces @@)
export const peekAll = (stack) => {
  console.log(...stack.toArray());
};

// view: alias for peekAll (backward compat for internal use)
export const view = peekAll;

// apply: pop top of stack (must be a function/block), execute it with the stack
export const apply = (stack) => {
  const block = stack.pop();
  if (typeof block !== "function") {
    throw new TypeError("apply: top of stack is not a function/block");
  }
  return block(stack);
};

// exec: alias for apply
export const exec = apply;
