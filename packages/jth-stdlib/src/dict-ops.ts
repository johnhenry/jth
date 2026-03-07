import { op, variadic } from "jth-runtime";

export const get = (key: string) => op(1)((obj: any) => [obj[key]]);
export const set = (key: string, value: any) =>
  op(1)((obj: any) => {
    obj[key] = value;
    return [obj];
  });
export const drill =
  (...keys: string[]) =>
  op(1)((obj) => {
    let target = obj;
    for (const key of keys) {
      if (target == null) break;
      target = target[key];
    }
    return [target];
  });
export const drillSet =
  (...keysAndValue: any[]) =>
  op(1)((obj) => {
    const value = keysAndValue[keysAndValue.length - 1];
    const keys = keysAndValue.slice(0, -1);
    let target = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    return [obj];
  });
export const keys = op(1)((obj) => [Object.keys(obj)]);
export const values = op(1)((obj) => [Object.values(obj)]);
export const entries = op(1)((obj) => [Object.entries(obj)]);
export const merge = op(2)((a, b) => [{ ...a, ...b }]);
export const hasKey = (key: string) => op(1)((obj: any) => [key in obj]);
export const record = variadic((...args) => {
  if (args.length % 2 !== 0)
    throw new Error("record requires even number of args");
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < args.length; i += 2) obj[args[i + 1] as string] = args[i];
  return [obj];
});
