const sort = (...stack) => stack.sort();

export const mean = (...stack) => {
  return [stack.reduceRight((a, b) => a + b, 0) / stack.length];
};
export const median = (...stack) => {
  const values = sort(...stack);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) {
    return [values[half]];
  }
  return [(values[half - 1] + values[half]) / 2];
};

export const mode = (...stack) => {
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
export const modes = (...stack) => {
  const counts = new Map();
  let max = 0;
  for (const item of stack) {
    const value = counts.get(item) || 0;
    counts.set(item, value + 1);
    if (value === max) {
      max++;
    }
  }
  const result = [...counts]
    .filter(([, value]) => value === max)
    .map(([key]) => key);
  return [...result, result.length];
};

export const populationVariance = (...stack) => {
  const n = stack.length;
  if (n < 1) {
    throw new Error("stack length must be greater than 0");
  }
  const [m] = mean(...stack);
  return [
    stack.map((x) => Math.pow(x - m, 2)).reduceRight((a, b) => a + b) / n,
  ];
};
export const sampleVariance = (...stack) => {
  const n = stack.length;
  if (n < 2) {
    throw new Error("stack length must be greater than 1");
  }
  const [m] = mean(...stack);
  return [
    stack.map((x) => Math.pow(x - m, 2)).reduceRight((a, b) => a + b) / (n - 1),
  ];
};

export const populationStandardDeviation = (...stack) => {
  return [Math.sqrt(populationVariance(...stack)[0])];
};
export const sampleStandardDeviation = (...stack) => {
  return [Math.sqrt(sampleVariance(...stack)[0])];
};

export const percentile =
  (d) =>
  (...stack) => {
    const index = d * (stack.length - 1);
    if (Number.isInteger(index)) {
      return [stack[index]];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      return [(stack[lower] + stack[upper]) / 2];
    }
  };

export const fiveNumberSummary = (...stack) => {
  const values = sort(...stack);
  const [m] = mean(...stack);
  const [lower, upper] = [values[0], values[values.length - 1]];
  const [q1] = percentile(0.25)(...values);
  const [q3] = percentile(0.75)(...values);
  return [lower, q1, m, q3, upper];
};

export const fiveNumberSummaryB = (...stack) => {
  const values = sort(...stack);
  const [m] = mean(...stack);
  const [q1] = percentile(0.25)(...values);
  const [q3] = percentile(0.75)(...values);
  const iqr = q3 - q1;
  const [min, max] = [q1 - 1.5 * iqr, q3 + 1.5 * iqr];
  return [...stack, min, q1, m, q3, max];
};
