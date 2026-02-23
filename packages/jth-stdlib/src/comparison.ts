import { op } from "jth-runtime";

export const equal = op(2)((a, b) => [a === b]);
export const coercedEqual = op(2)((a, b) => [a == b]);
export const notEqual = op(2)((a, b) => [a !== b]);
export const lt = op(2)((a, b) => [a < b]);
export const lte = op(2)((a, b) => [a <= b]);
export const gt = op(2)((a, b) => [a > b]);
export const gte = op(2)((a, b) => [a >= b]);
export const spaceship = op(2)((a, b) => [a === b ? 0 : a > b ? -1 : 1]);
