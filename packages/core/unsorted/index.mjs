import { applyLastN, attackStack, collapseBinary } from "../tools/index.mjs"; // jth-tools

export const mapLast =
  (fn) =>
  (...stack) => {
    const item = stack.pop();
    return [...stack, fn(item)];
  };

export const abs = (...stack) => {
  if (stack.length < 1) {
    return stack;
  }
  const item = Math.abs(stack.pop());
  return [...stack, item];
};

// Math functions
export const sqrt = applyLastN(1)((a) => [Math.sqrt(a)]);
export const floor = applyLastN(1)((a) => [Math.floor(a)]);
export const ceil = applyLastN(1)((a) => [Math.ceil(a)]);
export const round = applyLastN(1)((a) => [Math.round(a)]);
export const log = applyLastN(1)((a) => [Math.log(a)]);
export const log10 = applyLastN(1)((a) => [Math.log10(a)]);
export const log2 = applyLastN(1)((a) => [Math.log2(a)]);
export const sin = applyLastN(1)((a) => [Math.sin(a)]);
export const cos = applyLastN(1)((a) => [Math.cos(a)]);
export const tan = applyLastN(1)((a) => [Math.tan(a)]);

const _gcd = (A, B) => {
  let a = A,
    b = B;
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

export const gcd = (...stack) => {
  if (stack.length < 1) {
    return stack;
  }
  const a = stack.pop();
  const b = stack.pop();
  return [...stack, _gcd(a, b)];
};
export const gcdAll = (...stack) => [stack.reduceRight(_gcd)];

const _lcm = (A, B) => {
  return (A * B) / _gcd(A, B);
};
export const lcm = (...stack) => {
  if (stack.length < 1) {
    return stack;
  }
  const a = stack.pop();
  const b = stack.pop();
  return [_lcm(a, b)];
};

export const lcmAll = (...stack) => [stack.reduceRight(_lcm)];

export const createJSON = (...stack) => {
  if (stack.length % 2 !== 0) {
    throw new Error("Stack length must be even.");
  }
  const obj = {};
  for (let i = 0; i < stack.length; i += 2) {
    obj[stack[i + 1]] = stack[i];
  }
  return [obj];
};

export const createMap = (...stack) => {
  if (stack.length % 2 !== 0) {
    throw new Error("Stack length must be even.");
  }
  const obj = [];
  for (let i = 0; i < stack.length; i += 2) {
    obj.push([stack[i + 1], stack[i]]);
  }
  return [new Map(obj)];
};

export const keyFlip = (...stack) => {
  return stack.map((items) => items.reverse());
};

export const createSet = (...stack) => {
  return [new Set(stack)];
};

export const createArray = (...stack) => {
  return [stack];
};
export const createArrayReversed = (...stack) => {
  return [stack.reverse()];
};

export const readEnv = (...stack) => {
  const key = stack.pop();
  return [
    ...stack,
    typeof Deno !== "undefined" ? Deno.env.get(key) : process.env[key],
  ];
};

// String operations
export const split = (delimiter = " ") => applyLastN(1)((str) => str.split(delimiter));
export const toLowerCase = applyLastN(1)((str) => [str.toLowerCase()]);
export const toUpperCase = applyLastN(1)((str) => [str.toUpperCase()]);
export const trim = applyLastN(1)((str) => [str.trim()]);
export const trimStart = applyLastN(1)((str) => [str.trimStart()]);
export const trimEnd = applyLastN(1)((str) => [str.trimEnd()]);
export const startsWith = applyLastN(2)((str, prefix) => [str.startsWith(prefix)]);
export const endsWith = applyLastN(2)((str, suffix) => [str.endsWith(suffix)]);
export const substring = (start, end) => applyLastN(1)((str) => [str.substring(start, end)]);
