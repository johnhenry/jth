import { op } from "jth-runtime";

export const intoJson = op(1)((a) => [JSON.stringify(a)]);
export const toJson = op(1)((a) => [JSON.parse(a)]);
export const fromJson = toJson;
export const intoLines = op(1)((a) => [
  Array.isArray(a) ? a.join("\n") : String(a),
]);
export const toLines = op(1)((a) => [String(a).split("\n")]);
export const fromLines = toLines;
