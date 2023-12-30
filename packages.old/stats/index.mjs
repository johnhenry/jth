export const sort$ = function (stack) {
  const newStack = [...stack];
  return newStack.sort((a, b) => a - b);
};

export const sortD$ = function (stack) {
  const newStack = [...stack];
  return newStack.sort((a, b) => b - a);
};

export const randomize$ = function (stack) {
  const newStack = [...stack];
  const randomized = newStack.sort((a, b) => 0.5 - Math.random());
  return randomized;
};

export const sum$ = function (stack) {
  return [stack.reduce((a, b) => a + b, 0)];
};

export const product$ = function (stack) {
  return [stack.reduce((a, b) => a * b, 1)];
};

export const count$ = function (stack) {
  return [stack.length];
};
export const mean$ = function (stack) {
  return [stack.reduce((a, b) => a + b, 0) / stack.length];
};

export const median$ = function (stack) {
  const values = sort$(stack);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) {
    return [values[half]];
  }
  return [(values[half - 1] + values[half]) / 2];
};

export const mode$ = function (stack) {
  const counts = new Map();
  let max = 0;
  for (const item of stack) {
    const value = counts.get(item) || 0;
    counts.set(item, value + 1);
    if (value === max) {
      max++;
    }
  }
  return [[...counts].find(([, value]) => value === max)[0]];
};

export const modes$ = function (stack) {
  const counts = new Map();
  let max = 0;
  for (const item of stack) {
    const value = counts.get(item) || 0;
    counts.set(item, value + 1);
    if (value === max) {
      max++;
    }
  }
  return [...counts].filter(([, value]) => value === max).map(([key]) => key);
};

export const populationVariance$ = function (stack) {
  const n = stack.length;
  if (n < 1) {
    throw new Error("stack length must be greater than 0");
  }
  const [mean] = mean$(stack);
  return [stack.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n];
};
export const sampleVariance$ = function (stack) {
  const n = stack.length;
  if (n < 2) {
    throw new Error("stack length must be greater than 1");
  }
  const [mean] = mean$(stack);
  return [
    stack.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1),
  ];
};

export const populationStandardDeviation$ = function (stack) {
  return [Math.sqrt(populationVariance$(stack)[0])];
};
export const sampleStandardDeviation$ = function (stack) {
  return [Math.sqrt(sampleVariance$(stack)[0])];
};

export const percentile = (d) => (stack) => {
  const index = d * (stack.length - 1);
  if (Number.isInteger(index)) {
    return [stack[index]];
  } else {
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return [(stack[lower] + stack[upper]) / 2];
  }
};

export const fiveNumberSummary$ = function (stack) {
  const values = sort$(stack);
  const [mean] = mean$(stack);
  const [lower, upper] = [values[0], values[values.length - 1]];
  const [q1] = percentile(0.25)(values);
  const [q3] = percentile(0.75)(values);
  return [lower, q1, mean, q3, upper];
};

export const fiveNumberSummaryB$ = function (stack) {
  const values = sort$(stack);
  const [mean] = mean$(stack);
  const [q1] = percentile(0.25)(values);
  const [q3] = percentile(0.75)(values);
  const iqr = q3 - q1;
  const [min, max] = [q1 - 1.5 * iqr, q3 + 1.5 * iqr];
  return [min, q1, mean, q3, max];
};
