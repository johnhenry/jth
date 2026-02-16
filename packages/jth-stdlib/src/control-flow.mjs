import { op } from "jth-runtime";

// _condStack: side-channel on the stack object to track if/elseif/else match state.
// It's an array to handle nesting (inner if/elseif/else chains inside blocks).

function ensureCondStack(stack) {
  if (!stack._condStack) stack._condStack = [];
  return stack._condStack;
}

// if: supports two modes:
//   3-arg (legacy): #[ falseBlock ] #[ trueBlock ] condition if
//   2-arg (new):    #[ block ] condition if  — starts an if/elseif/else chain
//
// Detection: after popping condition (top) and block (below), peek at the next
// item. If it's a function, we're in 3-arg mode. Otherwise 2-arg mode.
export const ifOp = (stack) => {
  const condition = stack.pop();
  const block = stack.pop();

  // Peek at what's below to detect 3-arg vs 2-arg mode
  const below = stack.peek();
  if (typeof below === "function") {
    // 3-arg mode: below is falseBlock
    const falseBlock = stack.pop();
    const chosen = condition ? block : falseBlock;
    if (typeof chosen === "function") {
      chosen(stack);
    }
  } else {
    // 2-arg mode: start a conditional chain
    const condStack = ensureCondStack(stack);
    if (condition) {
      condStack.push(true); // matched
      if (typeof block === "function") block(stack);
    } else {
      condStack.push(false); // not yet matched
    }
  }
};

// elseif: #[ block ] condition elseif
// If already matched in this chain, skip. Otherwise check condition.
export const elseifOp = (stack) => {
  const condition = stack.pop();
  const block = stack.pop();
  const condStack = ensureCondStack(stack);

  if (condStack.length === 0) {
    // No preceding `if` — treat as no-op (defensive)
    return;
  }

  const alreadyMatched = condStack[condStack.length - 1];
  if (alreadyMatched) {
    // Already matched a previous branch — skip
    return;
  }

  if (condition) {
    condStack[condStack.length - 1] = true;
    if (typeof block === "function") block(stack);
  }
};

// else: #[ block ] else
// If already matched, skip and pop the condStack entry. Otherwise execute and pop.
export const elseOp = (stack) => {
  const block = stack.pop();
  const condStack = ensureCondStack(stack);

  if (condStack.length === 0) {
    return;
  }

  const alreadyMatched = condStack.pop();
  if (!alreadyMatched) {
    if (typeof block === "function") block(stack);
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
// Also supports N { block } times (reversed argument order)
export const timesOp = (stack) => {
  let top = stack.pop();
  let second = stack.pop();
  // Detect argument order: support both [block] N and N [block]
  let n, block;
  if (typeof top === "number" && typeof second === "function") {
    // Standard order: [block] N times
    n = top;
    block = second;
  } else if (typeof top === "function" && typeof second === "number") {
    // Reversed order: N [block] times
    n = second;
    block = top;
  } else {
    // Fallback to original behavior (top = n, second = block)
    n = top;
    block = second;
  }
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
