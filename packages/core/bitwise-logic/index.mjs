import { attackStack, collapseBinary } from "../tools/index.mjs"; //jth-tools

export const and = attackStack((n) => collapseBinary(n, (a, b) => [a & b]), 2);

export const or = attackStack((n) => collapseBinary(n, (a, b) => [a | b]), 2);

export const not = (...stack) => {
  const item = ~stack.pop();
  return [...stack, item];
};

export const xor = attackStack((n) => collapseBinary(n, (a, b) => [a ^ b]), 2);

export const leftShift = attackStack(
  (n) => collapseBinary(n, (a, b) => [a << b]),
  2
);

export const rightShift = attackStack(
  (n) => collapseBinary(n, (a, b) => [a >> b]),
  2
);

export const rightShiftZeroFill = attackStack(
  (n) => collapseBinary(n, (a, b) => [a >>> b]),
  2
);
