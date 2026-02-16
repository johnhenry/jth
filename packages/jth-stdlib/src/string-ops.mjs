import { op } from "jth-runtime";

export const len = op(1)((a) => [a.length]);
export const split = (delimiter = " ") => op(1)((str) => [str.split(delimiter)]);
export const replace = (search, replacement) =>
  op(1)((str) => [str.replace(search, replacement)]);
export const startsWith = op(2)((str, prefix) => [str.startsWith(prefix)]);
export const endsWith = op(2)((str, suffix) => [str.endsWith(suffix)]);
export const upper = op(1)((str) => [str.toUpperCase()]);
export const lower = op(1)((str) => [str.toLowerCase()]);
export const trim = op(1)((str) => [str.trim()]);
export const slice = (start, end) => op(1)((str) => [str.slice(start, end)]);
export const indexOf = op(2)((str, search) => [str.indexOf(search)]);
export const strcat = op(2)((a, b) => [`${a}${b}`]);
export const strseq = op(2)((a, b) => [`${b}${a}`]);
export const join = (sep = " ") => op(1)((arr) => [arr.join(sep)]);
export const substring = (start, end) =>
  op(1)((str) => [str.substring(start, end)]);
