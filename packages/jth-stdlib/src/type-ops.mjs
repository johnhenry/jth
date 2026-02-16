import { op } from "jth-runtime";

export const typeOf = op(1)((a) => [typeof a]);
export const isNumber = op(1)((a) => [typeof a === "number"]);
export const isString = op(1)((a) => [typeof a === "string"]);
export const isArray = op(1)((a) => [Array.isArray(a)]);
export const isNil = op(1)((a) => [a == null]);
export const isFunction = op(1)((a) => [typeof a === "function"]);
// isError defined in error-handling.mjs
export const isEmpty = op(1)((a) => {
  if (a == null) return [true];
  if (typeof a === "string" || Array.isArray(a)) return [a.length === 0];
  if (typeof a === "object") return [Object.keys(a).length === 0];
  return [false];
});
export const contains = op(2)((collection, item) => {
  if (Array.isArray(collection)) return [collection.includes(item)];
  if (typeof collection === "string") return [collection.includes(item)];
  return [false];
});
