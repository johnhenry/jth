import { variadic } from "jth-runtime";

export const mean = variadic(
  (...args) => [args.reduce((a, b) => a + b, 0) / args.length]
);

export const median = variadic((...args) => {
  const sorted = [...args].sort((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? [sorted[half]]
    : [(sorted[half - 1] + sorted[half]) / 2];
});

export const mode = variadic((...args) => {
  const counts = new Map();
  let maxCount = 0;
  for (const item of args) {
    const c = (counts.get(item) || 0) + 1;
    counts.set(item, c);
    if (c > maxCount) maxCount = c;
  }
  return [[...counts].find(([, v]) => v === maxCount)[0]];
});

export const modes = variadic((...args) => {
  const counts = new Map();
  let maxCount = 0;
  for (const item of args) {
    const c = (counts.get(item) || 0) + 1;
    counts.set(item, c);
    if (c > maxCount) maxCount = c;
  }
  return [
    [...counts].filter(([, v]) => v === maxCount).map(([k]) => k),
  ];
});

export const populationVariance = variadic((...args) => {
  const m = args.reduce((a, b) => a + b, 0) / args.length;
  return [args.reduce((sum, x) => sum + (x - m) ** 2, 0) / args.length];
});

export const sampleVariance = variadic((...args) => {
  const m = args.reduce((a, b) => a + b, 0) / args.length;
  return [args.reduce((sum, x) => sum + (x - m) ** 2, 0) / (args.length - 1)];
});

export const populationStdDev = variadic((...args) => {
  const m = args.reduce((a, b) => a + b, 0) / args.length;
  return [
    Math.sqrt(args.reduce((sum, x) => sum + (x - m) ** 2, 0) / args.length),
  ];
});

export const sampleStdDev = variadic((...args) => {
  const m = args.reduce((a, b) => a + b, 0) / args.length;
  return [
    Math.sqrt(
      args.reduce((sum, x) => sum + (x - m) ** 2, 0) / (args.length - 1)
    ),
  ];
});
