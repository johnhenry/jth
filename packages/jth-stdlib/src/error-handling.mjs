import { op } from "jth-runtime";

// try: { block } try -> executes block, pushes Error on failure
export const tryOp = (stack) => {
  const block = stack.pop();
  try {
    if (typeof block === "function") block(stack);
  } catch (e) {
    stack.push(e instanceof Error ? e : new Error(String(e)));
  }
};

// throw: "message" throw -> throws an error
export const throwOp = op(1)((msg) => {
  throw new Error(String(msg));
});

// error?: check if top of stack is an Error
export const isError = op(1)((a) => [a instanceof Error]);
