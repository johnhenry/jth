import { applyLastN } from "../tools/index.mjs"; // jth-tools
export const fibonacci = applyLastN(2)((a, b) => [b, a, b + a]);
