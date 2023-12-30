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
