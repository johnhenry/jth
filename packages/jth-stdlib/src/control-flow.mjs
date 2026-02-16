import { op } from "jth-runtime";

// if: { falseBlock } { trueBlock } condition if
// Pops: condition (top), trueBlock, falseBlock. Executes one block.
export const ifOp = (stack) => {
  const condition = stack.pop();
  const trueBlock = stack.pop();
  const falseBlock = stack.pop();
  const block = condition ? trueBlock : falseBlock;
  if (typeof block === "function") {
    block(stack);
  }
};

// when: value condition when -> keeps value if condition truthy, drops if falsy
export const when = (stack) => {
  const condition = stack.pop();
  if (!condition) stack.pop(); // drop the value
};

// dropWhen: value condition dropWhen -> drops value if condition truthy, keeps if falsy
// FIX BUG: old code dropped in BOTH branches (copy-paste bug)
export const dropWhen = (stack) => {
  const condition = stack.pop();
  if (condition) stack.pop(); // only drop in true branch
};

// keepIf: value condition keepIf -> keep value if truthy
export const keepIf = op(2)((value, condition) => (condition ? [value] : []));

// dropIf: value condition dropIf -> drop value if truthy
export const dropIf = op(2)((value, condition) => (condition ? [] : [value]));

// times: { block } N times -- executes block N times
export const timesOp = (stack) => {
  const n = stack.pop();
  const block = stack.pop();
  for (let i = 0; i < n; i++) {
    if (typeof block === "function") block(stack);
  }
};

// loop: { block } N loop -- execute block N times (configured)
export const loop = (n) => (stack) => {
  const block = stack.pop();
  for (let i = 0; i < n; i++) {
    if (typeof block === "function") block(stack);
  }
};
