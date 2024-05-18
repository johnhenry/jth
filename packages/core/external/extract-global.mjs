/**
 * @description Extracts values from a dictionary and assigns them to the global object.
 * @example
 * ```javascript
 * const values = { a: 1, b: 2, c: 3};
 * extractGlobal(values);
 * console.log(a); // 1
 * console.log(b); // 2
 * console.log(c); // 3
 * ```
 * @param {Dict} values - The dictionary to extract values from
 * @param {Dict}
 *  - rename: Dict - A dictionary of keys to rename
 *  - target: Object - The object to assign the values to
 *  - allowDefault: boolean - Whether to allow the default key to be assigned
 * @returns
 * - number of entries
 */

export const extractGlobal = (
  values = {},
  { rename = {}, target = globalThis, allowDefault = false } = {
    rename: {},
    target: globalThis,
    allowDefault: false,
  }
) => {
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    if (allowDefault || key !== "default") {
      target[rename[key] || key] = value;
    }
  }
  return entries.length;
};
export default extractGlobal;
