const metaStore = new WeakMap();

export function annotate(fn, meta) {
  const wrapper = (...args) => fn(...args);
  metaStore.set(wrapper, { ...getMeta(fn), ...meta });
  return wrapper;
}

export function getMeta(fn) {
  return metaStore.get(fn) || {};
}

// Convenience wrappers
export function delay(n) {
  return (fn) => annotate(fn, { delay: n });
}

export function persist(n) {
  return (fn) => annotate(fn, { persist: n });
}

export function rewind(n) {
  return (fn) => annotate(fn, { rewind: n });
}

export function skip(n) {
  return (fn) => annotate(fn, { skip: n });
}

export function limit(n) {
  return (fn) => annotate(fn, { limit: n });
}
