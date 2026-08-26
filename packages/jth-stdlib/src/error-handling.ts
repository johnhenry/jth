import { op } from "@johnhenry/jth-runtime";
import type { Stack } from "@johnhenry/jth-runtime";
import { JthRuntimeError } from "@johnhenry/jth-types";

// try: { block } try -> executes block, pushes Error on failure
//
// Contract (README.md): `try` always leaves exactly one new value — the
// Error — on the stack after a failing block, regardless of what that
// block pushed before it threw. Snapshot the depth before running the
// block; on catch, discard anything the block pushed above that depth
// before pushing the caught Error, so debris from a partially-executed
// block never leaks onto the stack (and nested `try` doesn't compound it).
export const tryOp = (stack: Stack) => {
  const block = stack.pop();
  const depthBefore = stack.length;
  try {
    if (typeof block === "function") block(stack);
  } catch (e) {
    const pushed = stack.length - depthBefore;
    if (pushed > 0) stack.popN(pushed);
    stack.push(e instanceof Error ? e : new Error(String(e)));
  }
};

// throw: "message" throw -> throws an error
export const throwOp = op(1)((msg) => {
  throw new JthRuntimeError(String(msg), undefined, undefined, "USER_THROW");
});

// error?: check if top of stack is an Error
export const isError = op(1)((a) => [a instanceof Error]);
