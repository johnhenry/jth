import quiz, { deepequal, ok, equal } from "pop-quiz";

import {
  mean$,
  median$,
  mode$,
  modes$,
  sort$,
  sortD$,
  randomize$,
  sum$,
  product$,
  populationVariance$,
  populationStandardDeviation$,
  sampleVariance$,
  sampleStandardDeviation$,
  fiveNumberSummary$,
  fiveNumberSummaryB$,
} from "./index.mjs";

await quiz("Standard statistical functions", function* () {
  const stack = [7, 1, 5, 3, 14, 2, 22, 3, 28, 5, 9];
  const stackA = [...stack].sort((a, b) => a - b);
  const stackD = [...stack].sort((a, b) => b - a);
  yield deepequal(mean$(stack), [9], "mean");
  yield deepequal(median$(stack), [5], "median");
  yield deepequal(mode$(stack), [5], "mode");
  yield deepequal(modes$(stack), [5, 3], "modes");
  yield deepequal(sum$(stack), [99], "sum");
  yield deepequal(product$(stack), [244490400], "product");
  yield deepequal(
    populationVariance$(stack),
    [70.54545454545455],
    "variance (population)"
  );
  yield deepequal(
    populationStandardDeviation$(stack),
    [8.39913415450989],
    "sd (population)"
  );
  yield deepequal(sampleVariance$(stack), [77.6], "variance (sample)");
  yield deepequal(
    sampleStandardDeviation$(stack),
    [8.809086218218097],
    "sd (sample)"
  );
  yield deepequal(sort$(stack), stackA, "sort");
  yield deepequal(sortD$(stack), stackD, "sort (Descending)");
  yield deepequal(
    fiveNumberSummary$(stack),
    [1, 3, 9, 11.5, 28],
    "five numbre summary"
  );
  yield deepequal(
    fiveNumberSummaryB$(stack),
    [-9.75, 3, 9, 11.5, 24.25],
    "five numbre summary (alternate)"
  );
});

await quiz(
  "randomize$ should return stack with items in a random order",
  function* () {
    const stack = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    const result = randomize$(stack);
    yield equal(
      stack.length,
      result.length,
      "result and stack have same length"
    );
    yield ok(
      result.every((x) => stack.includes(x)),
      `every item in result is in stack`
    );
    yield ok(
      stack.every((x) => result.includes(x)),
      `every item in stack is in result`
    );
  }
);
