const staticOperators = {};
const dynamicOperators = new Map();
/**
 * @description Set an operator
 * @param {string|RegExp} k - The operator to set
 * @param {function} v - The function to set
 * @returns {void}
 * @example
 * ```javascript
 * set("foo", () => "bar");
 * operators("foo"); // () => "bar"
 * ```
 */

export const set = (k, v) => {
  typeof k !== "string" ? dynamicOperators.set(k, v) : (staticOperators[k] = v);
};
export const setList = (...list) => {
  for (const [k, v] of list) {
    set(k, v);
  }
};
export const setObj = (obj) => {
  for (const [k, v] of obj instanceof Map ? obj : Object.entries(obj)) {
    set(k, v);
  }
};
export const clear = () => {
  for (const key of Object.keys(staticOperators)) {
    delete staticOperators[key];
  }
  dynamicOperators.clear();
};
export const remove = (key) => {
  if (typeof key === "string") {
    delete staticOperators[key];
    return;
  }
  dynamicOperators.delete(key);
};
export const operators = (o) => {
  if (staticOperators[o]) {
    return staticOperators[o];
  }
  for (const [match, func] of dynamicOperators) {
    if (match.test(o)) {
      return func(o, match);
    }
  }
};
export default operators;
