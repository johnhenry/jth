import { attackStack, collapseBinary } from "../tools/index.mjs"; //jth-tools

export const bitwiseAnd = attackStack(
  (n) => collapseBinary(n, (a, b) => [a & b]),
  2
);

export const bitwiseOr = attackStack(
  (n) => collapseBinary(n, (a, b) => [a | b]),
  2
);

export const bitwiseNot = (...stack) => {
  const item = ~stack.pop();
  return [...stack, item];
};

export const bitwiseXor = attackStack(
  (n) => collapseBinary(n, (a, b) => [a ^ b]),
  2
);

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
