import { op } from "jth-runtime";

export const and = op(2)((a, b) => [a && b]);
export const or = op(2)((a, b) => [a || b]);
export const xor = op(2)((a, b) => [!!(a ^ b)]);
export const nand = op(2)((a, b) => [!(a && b)]);
export const nor = op(2)((a, b) => [!(a || b)]);
export const not = op(1)((a) => [!a]);
