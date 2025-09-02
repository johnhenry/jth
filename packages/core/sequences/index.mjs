import { applyLastN } from "../tools/index.mjs"; // jth-tools

/**
 * @description Generate the next number in the fibonacci sequence
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 * */
export const fibonacci = applyLastN(2)((a, b) => [b, a, b + a]);
