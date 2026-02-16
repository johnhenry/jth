import { op } from "jth-runtime";

export const fibonacci = op(2)((a, b) => [b, a, b + a]);
