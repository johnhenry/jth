import { op } from "jth-runtime";
import { Stack } from "jth-runtime";

// zip: [array1] [array2] zip — pair elements element-wise: [[a1,b1], [a2,b2], ...]
// Truncates to shorter array length.
export const zip = op(2)((arr1, arr2) => {
  const len = Math.min(arr1.length, arr2.length);
  return [Array.from({ length: len }, (_, i) => [arr1[i], arr2[i]])];
});

// compose: [block1] [block2] compose — create a new block that runs block1 then block2
// Pops two blocks; pushes a single composed block.
export const compose = op(2)((a, b) => [
  (stack) => {
    a(stack);
    b(stack);
  },
]);

// each: item1 item2 ... itemN [block] each — apply block to each item on the stack (variadic)
// Pops the block (top of stack), then pops all remaining items.
// For each item, pushes it onto an isolated stack, runs the block, collects results.
// All results are pushed back onto the original stack in order.
export const each = (stack) => {
  const block = stack.pop();
  const items = stack.toArray();
  stack.clear();
  for (const item of items) {
    const s = new Stack();
    s.push(item);
    if (typeof block === "function") block(s);
    // Collect all results from the isolated stack (block may produce 0, 1, or many)
    stack.push(...s.toArray());
  }
};

// fanout: value [block1] [block2] ... [blockN] fanout — run value through each block, push all results
// Pops all functions (blocks) from top of stack, then pops the value (first non-function).
// For each block, pushes value onto an isolated stack, runs the block, collects result.
// All results are pushed onto the original stack.
export const fanout = (stack) => {
  const all = stack.toArray();
  stack.clear();

  // Walk from top (end) backwards collecting functions
  const blocks = [];
  let i = all.length - 1;
  while (i >= 0 && typeof all[i] === "function") {
    blocks.unshift(all[i]);
    i--;
  }

  // The value is the next item (first non-function from top)
  const value = i >= 0 ? all[i] : undefined;

  // Restore everything below the value
  for (let j = 0; j < i; j++) {
    stack.push(all[j]);
  }

  // Run value through each block
  for (const block of blocks) {
    const s = new Stack();
    s.push(value);
    block(s);
    stack.push(...s.toArray());
  }
};

// tap: execute block without consuming values (clone -> execute -> discard clone)
// Legacy/internal — not registered as a jth word.
export const tap = (block) => (stack) => {
  const clone = stack.clone();
  block(clone);
};

// dip: pop top, execute block on rest, push top back
// Legacy/internal — not registered as a jth word.
export const dip = (block) => (stack) => {
  const top = stack.pop();
  block(stack);
  stack.push(top);
};
