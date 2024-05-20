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
  const obj = {};
  while (stack.length) {
    const key = stack.pop();
    const value = stack.pop();
    obj[key] = value;
  }
  return [obj];
};

export const createMap = (...stack) => {
  const obj = new Map();
  while (stack.length) {
    const key = stack.pop();
    const value = stack.pop();
    obj.set(key, value);
  }
  return [obj];
};

export const createSet = (...stack) => {
  const obj = new Set();
  while (stack.length) {
    const value = stack.pop();
    obj.add(value);
  }
  return [obj];
};

export const readEnv = (...stack) => {
  const key = stack.pop();
  return [
    ...stack,
    typeof Deno !== "undefined" ? Deno.env.get(key) : process.env[key],
  ];
};
