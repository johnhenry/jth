import type { MetaAnnotations } from "jth-types/interfaces";

type AnyFunction = (...args: unknown[]) => unknown;

const metaStore = new WeakMap<AnyFunction, MetaAnnotations>();

export function annotate(fn: AnyFunction, meta: MetaAnnotations): AnyFunction {
  const wrapper: AnyFunction = (...args) => fn(...args);
  metaStore.set(wrapper, { ...getMeta(fn), ...meta });
  return wrapper;
}

export function getMeta(fn: AnyFunction): MetaAnnotations {
  return metaStore.get(fn) || {};
}

// Convenience wrappers
export function delay(n: number) {
  return (fn: AnyFunction) => annotate(fn, { delay: n });
}

export function persist(n: number) {
  return (fn: AnyFunction) => annotate(fn, { persist: n });
}

export function rewind(n: number) {
  return (fn: AnyFunction) => annotate(fn, { rewind: n });
}

export function skip(n: number) {
  return (fn: AnyFunction) => annotate(fn, { skip: n });
}

export function limit(n: number) {
  return (fn: AnyFunction) => annotate(fn, { limit: n });
}
