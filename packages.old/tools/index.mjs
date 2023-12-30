export const identity$ = (stack) => stack;
export const clear$ = () => [];
export const collect$ = function (stack) {
  return [stack];
};
export const repeat$ = function (stack) {
  return [...stack, ...stack];
};
export const dupe$ = function (stack) {
  const newStack = [...stack];
  const duped = newStack.pop();
  return [...newStack, duped, duped];
};
export const if$ = function (stack) {
  const newStack = [...stack];
  const condition = newStack.pop();
  const result = newStack.pop();
  return condition ? [...newStack, result] : newStack;
};
export const ifElse$ = function (stack) {
  const newStack = [...stack];
  const condition = newStack.pop();
  const result = newStack.pop();
  return condition ? [result] : newStack;
};

export const ifExe$ = function (stack) {
  const newStack = [...stack];
  const condition = newStack.pop();
  const exe0 = newStack.pop();
  const exe1 = newStack.pop();
  return condition ? exe0(newStack) : exe1(newStack);
};

export const equal$ = function (stack) {
  const newStack = [...stack];
  let last = newStack.pop();
  newStack.reverse();
  for (const item of newStack) {
    if (item !== last) {
      return [false];
    }
    last = item;
  }
  return [true];
};

export const and$ = function (stack) {
  const newStack = [...stack].reverse();
  for (const item of newStack) {
    if (!item) {
      return [];
    }
  }
  return stack;
};

export const or$ = function (stack) {
  const newStack = [...stack];
  while (!newStack[newStack.length - 1]) {
    newStack.pop();
  }
  return newStack;
};

export const reverse$ = function (stack) {
  const newStack = [...stack];
  return newStack.reverse();
};

export const first$ = function (stack) {
  return [stack[0]];
};

export const last$ = function (stack) {
  return [stack[stack.length - 1]];
};

export const reduceLeft$ = function (stack, init) {
  const newStack = [...stack];
  const binary = newStack.pop();
  let result = init ?? newStack.shift();
  while (newStack.length) {
    result = binary(result, newStack.shift());
  }
  return [result];
};

export const foldLeft = (init) => (stack) => reduceLeft$(stack, init);

export const reduceRight$ = function (stack, init) {
  const newStack = [...stack];
  const binary = newStack.pop();
  let result = init ?? newStack.pop();
  while (newStack.length) {
    result = binary(newStack.pop(), result);
  }
  return [result];
};

export const foldRight = (init) => (stack) => reduceRight$(stack, init);

export const selectLast$ = function (stack, index) {
  const newStack = [...stack];
  const i = index ?? newStack.pop();
  return [newStack.at(-i)];
};
export const selectLast =
  (index = 0) =>
  (stack) =>
    selectLast$(stack, index);

export const selectFirst$ = function (stack, index) {
  const newStack = [...stack];
  const i = index ?? newStack.pop();
  return [newStack.at(i)];
};

export const selectFirst =
  (index = 0) =>
  (stack) =>
    selectFirst$(stack, index);
export const takeFirst$ = function (stack) {
  const newStack = [...stack];
  const length = newStack.pop();
  return newStack.slice(length);
};

export const takeLast$ = function (stack) {
  const newStack = [...stack];
  const length = newStack.pop();
  return newStack.slice(-length);
};

export const drop$ = function (stack) {
  // const newStack = [...stack];
  // newStack.pop();
  // return newStack;
};
export const dropFirst$ = function (stack) {
  const newStack = [...stack];
  newStack.pop();
  return newStack;
};

export const dropLast$ = function (stack) {
  const newStack = [...stack];
  newStack.pop();
  return newStack;
};

export const filter$ = function (stack) {
  const newStack = [...stack];
  const fn = newStack.pop();
  return newStack.filter(fn);
};

export const map$ = function (stack) {
  const newStack = [...stack];
  const fn = newStack.pop();
  return [...newStack].map(fn);
};

export const mapAsync$ = async function (stack) {
  const newStack = [...stack];
  const fn = newStack.pop();
  return Promise.all([...newStack].map(fn));
};

const numStack = (stack) => {
  const nums = [...stack];
  const end = nums.pop();
  const start = nums.pop();
  const ascending = end > start;
  return {
    start,
    end,
    ascending,
    nums,
  };
};

const numProc = (nums, ascending, start, end) => {
  if (ascending) {
    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
  } else {
    for (let i = start; i >= end; i--) {
      nums.push(i);
    }
  }
  return nums;
};

// 5 8 to$ @!!; 6 7
export const to$ = function (stack) {
  const { start, end, ascending, nums } = numStack(stack);
  return numProc(
    nums,
    ascending,
    ascending ? start + 1 : start - 1,
    ascending ? end - 1 : end + 1
  );
};
// 5 8 fromTo$ @!!; 5 6 7
export const fromTo$ = function (stack) {
  const { start, end, ascending, nums } = numStack(stack);
  return numProc(nums, ascending, start, ascending ? end - 1 : end + 1);
};
// 5 8 toInc$  @!!; 6 7 8

export const toInc$ = function (stack) {
  const { start, end, ascending, nums } = numStack(stack);
  return numProc(nums, ascending, ascending ? start + 1 : start - 1, end);
};
// 5 8 fromToInc$ @!!; 5 6 7 8

export const fromToInc$ = function (stack) {
  const { start, end, ascending, nums } = numStack(stack);
  return numProc(nums, ascending, start, end);
};
