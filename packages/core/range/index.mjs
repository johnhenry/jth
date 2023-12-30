const numStack = (...stack) => {
  const end = stack.pop();
  const start = stack.pop();
  const ascending = end > start;
  return {
    start,
    end,
    ascending,
    stack,
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

// 5 8 to @!!; 6 7
export const to = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [
    ...numProc(
      nums,
      ascending,
      ascending ? start + 1 : start - 1,
      ascending ? end - 1 : end + 1
    ),
  ];
};
// 5 8 fromTo @!!; 5 6 7
export const fromTo = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, start, ascending ? end - 1 : end + 1)];
};
// 5 8 toInc  @!!; 6 7 8

export const toInc = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, ascending ? start + 1 : start - 1, end)];
};
// 5 8 fromToInc @!!; 5 6 7 8

export const fromToInc = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, start, end)];
};
