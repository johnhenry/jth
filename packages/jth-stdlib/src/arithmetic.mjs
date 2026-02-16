import { op, variadic } from "jth-runtime";

export const plus = op(2)((a, b) => [a + b]);
export const minus = op(2)((a, b) => [a - b]);
export const times = op(2)((a, b) => [a * b]);
export const divide = op(2)((a, b) => [a / b]);
export const exp = op(2)((a, b) => [a ** b]);
export const mod = op(2)((a, b) => [((a % b) + b) % b]); // mathematical mod
export const modulus = op(2)((a, b) => [a % b]); // JS remainder
export const inc = op(1)((a) => [a + 1]);
export const dec = op(1)((a) => [a - 1]);
export const sum = variadic((...args) => [args.reduce((a, b) => a + b, 0)]);
export const product = variadic((...args) => [args.reduce((a, b) => a * b, 1)]);
export const abs = op(1)((a) => [Math.abs(a)]);
export const sqrt = op(1)((a) => [Math.sqrt(a)]);
export const floor = op(1)((a) => [Math.floor(a)]);
export const ceil = op(1)((a) => [Math.ceil(a)]);
export const round = op(1)((a) => [Math.round(a)]);
export const trunc = op(1)((a) => [Math.trunc(a)]);
export const log = op(1)((a) => [Math.log(a)]);
export const min = variadic((...args) => [Math.min(...args)]);
export const max = variadic((...args) => [Math.max(...args)]);
