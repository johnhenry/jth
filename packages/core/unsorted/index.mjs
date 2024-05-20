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
