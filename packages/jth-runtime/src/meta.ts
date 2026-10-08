import type { MetaAnnotations } from "@johnhenry/jth-types/interfaces";

import { operatorInfo } from "./registry.ts";

type AnyFunction = (...args: unknown[]) => unknown;

const metaStore = new WeakMap<AnyFunction, MetaAnnotations>();

export function annotate(fn: AnyFunction, meta: MetaAnnotations): AnyFunction {
  const wrapper: AnyFunction = (...args) => fn(...args);
  metaStore.set(wrapper, { ...getTiming(fn), ...meta });
  return wrapper;
}

/**
 * Execution-timing annotations only (delay/persist/rewind/skip/limit).
 * This is what the stack machine reads; it never allocates on the hot path.
 */
export function getTiming(fn: AnyFunction): MetaAnnotations {
  return metaStore.get(fn) || {};
}

/**
 * Annotations for `fn`: its timing annotations plus, for operators that
 * were registered with documentation, `description` and `arity` from the
 * operator registry (the single source of per-op descriptions).
 */
export function getMeta(fn: AnyFunction): MetaAnnotations {
  const timing = metaStore.get(fn);
  const info = operatorInfo(fn);
  if (!info) return timing || {};
  return { ...timing, description: info.description, arity: info.arity };
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
