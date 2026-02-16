import { op } from "jth-runtime";

export const next = op(1)((obj) => {
  if (!obj?.next) return [obj];
  const { done, value } = obj.next();
  return done ? [obj] : [obj, value];
});

export const drain =
  (n = 1) =>
  op(1)((obj) => {
    const results = [obj];
    if (obj && typeof obj.next === "function") {
      for (let i = 0; i < n; i++) {
        const { done, value } = obj.next();
        if (done) break;
        results.splice(results.length - 1, 0, value); // insert before iterator
      }
    }
    return results;
  });

export const iter = op(1)((a) => {
  if (a && typeof a[Symbol.iterator] === "function")
    return [a[Symbol.iterator]()];
  return [a];
});

export const exhaustIterator = op(1)((a) => {
  if (a && a[Symbol.iterator]) return [[...a]];
  return [a];
});
