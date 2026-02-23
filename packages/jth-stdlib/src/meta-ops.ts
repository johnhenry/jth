import { processN } from "jth-runtime";
import type { Stack } from "jth-runtime";

// $: execute -- pop block and execute it
export const execute = (stack: Stack) => {
  const block = stack.pop();
  if (typeof block === "function") {
    const result = block(stack);
    if (result && typeof result.then === "function") return result;
  }
};

// $$: executeSpread -- pop array, execute as items
export const executeSpread = (stack: Stack) => {
  const arr = stack.pop();
  if (Array.isArray(arr)) {
    return processN(stack, arr);
  }
};
