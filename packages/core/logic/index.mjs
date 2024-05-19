import { applyLastN, attackStack, collapseBinary } from "../tools/index.mjs"; //jth-tools

export const and = attackStack((n) => collapseBinary(n, (a, b) => [a && b]), 2);
export const andAll = (...stack) => [stack.reduceRight((a, b) => a && b, true)];
export const or = attackStack((n) => collapseBinary(n, (a, b) => [a || b]), 2);
export const orAll = (...stack) => [stack.reduceRight((a, b) => a || b, false)];

export const not = (...stack) => {
  const item = !stack.pop();
  return [...stack, item];
};

////////////////
// Experimental
////////////////
export const when =
  (condition = true) =>
  (...stack) => {
    if (typeof condition === "function" ? condition(...stack) : condition) {
      return stack;
    }
    stack.pop();
    return stack;
  };

export const dropWhen =
  (condition = true) =>
  (...stack) => {
    if (typeof condition === "function" ? condition(...stack) : condition) {
      stack.pop();
      return stack;
    }
    stack.pop();
    return stack;
  };

export const whenever =
  (condition, ...pre) =>
  (...stack) => {
    while (condition(...stack)) {
      stack = pre(...stack);
    }
    return stack;
  };

export const wheneverRepeat =
  (condition, ...pre) =>
  (...stack) => {
    if (condition(...stack)) {
      return [
        ...stack,
        ...pre,
        wheneverRepeat(condition, ...pre),
        rewindN(2)(),
      ];
    }
    return [...stack];
  };

/*
1 persistN()(sum) whenever((...stack)=>stack.length < 6, [rewindN(2)()], [drop])
1 wheneverRepeat((...stack)=>stack.length < 6, sum)

1 whenever((...stack)=>stack.length < 6, sum);
*/

export const keepIf = applyLastN(2)((condition, affirmative) =>
  condition ? [affirmative] : []
);

export const dropIf = applyLastN(2)((condition, affirmative) =>
  condition ? [] : [affirmative]
);
export const keepIfElse = applyLastN(3)((condition, affirmative, negative) =>
  condition ? [affirmative] : [negative]
);

export const dropIfElse = applyLastN(3)((condition, affirmative, negative) =>
  condition ? [negative] : [affirmative]
);
