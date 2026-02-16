import { op } from "jth-runtime";

// compose: combine two blocks into one
export const compose = op(2)((a, b) => [
  (stack) => {
    a(stack);
    b(stack);
  },
]);

// tap: execute block without consuming values (clone -> execute -> discard clone)
export const tap = (block) => (stack) => {
  const clone = stack.clone();
  block(clone);
};

// dip: pop top, execute block on rest, push top back
export const dip = (block) => (stack) => {
  const top = stack.pop();
  block(stack);
  stack.push(top);
};

// fanout: apply N blocks to same value
export const fanout =
  (...blocks) =>
  (stack) => {
    const val = stack.pop();
    for (const block of blocks) {
      stack.push(val);
      block(stack);
    }
  };
