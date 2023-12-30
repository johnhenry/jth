import { applyLastN, attackStack } from "../tools/index.mjs"; //jth-tools

export const next = applyLastN(1)((obj) => {
  if (!obj?.next) {
    return [obj];
  }
  const { done, value } = obj.next();
  if (done) {
    return [obj];
  }
  return [obj, value];
});
export const drain = attackStack((index = 0, n = 1) => (...stack) => {
  const spare = [];
  for (let i = 0; i < index; i++) {
    spare.push(stack.pop());
  }
  const obj = stack.pop();
  if (Array.isArray(obj)) {
    for (let i = 0; i < n; i++) {
      if (!obj.length) {
        return stack;
      }
      stack.push(obj.shift());
    }
    return [...stack, obj, ...spare];
  }
  if (obj.next) {
    for (let i = 0; i < n; i++) {
      const { done, value } = obj.next();
      if (done) {
        return stack;
      }
      stack.push(value);
    }
    return [...stack, obj, ...spare];
  }
  return [obj];
});
export const iter = (...stack) => {
  const a = stack[stack.length - 1];
  if (typeof a[Symbol.iterator] === "function") {
    return [a[Symbol.iterator]()];
  }
  return stack;
};
