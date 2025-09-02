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

/**
 * @description Create a range of numbers, excluding the start and end values.
 * @param {any} stack
 * @returns {any[]}
 */
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

/**
 * @description Create a range of numbers, including the start value but excluding the end value.
 * @param {any} stack
 * @returns {any[]}
 */
export const fromTo = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, start, ascending ? end - 1 : end + 1)];
};

/**
 * @description Create a range of numbers, excluding the start value but including the end value.
 * @param {any} stack
 * @returns {any[]}
 */
export const toInc = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, ascending ? start + 1 : start - 1, end)];
};

/**
 * @description Create a range of numbers, including the start and end values.
 * @param {any} stack
 * @returns {any[]}
 */
export const fromToInc = (...stack) => {
  const { start, end, ascending, stack: nums } = numStack(...stack);
  return [...numProc(nums, ascending, start, end)];
};
