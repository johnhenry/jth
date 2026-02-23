import type { Stack } from "jth-runtime";

// wait (_): await a promise on top of stack
export const wait = (stack: Stack) => {
  const val = stack.pop() as any;
  if (val && typeof val.then === "function") {
    return val.then((resolved: any) => {
      stack.push(resolved);
    });
  }
  stack.push(val);
};

// waitAll (__): await all promises on stack
export const waitAll = async (stack: Stack) => {
  const arr = stack.toArray();
  stack.clear();
  const results = await Promise.all(arr);
  stack.push(...results);
};
