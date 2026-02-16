const staticOps = new Map();
const dynamicOps = []; // Array of { pattern: RegExp, factory: Function }

export const registry = {
  set(name, fn) {
    staticOps.set(name, fn);
  },

  get(name) {
    if (staticOps.has(name)) return staticOps.get(name);
    for (const { pattern, factory } of dynamicOps) {
      if (pattern.test(name)) return factory(name, pattern);
    }
    return undefined;
  },

  resolve(name) {
    const fn = registry.get(name);
    if (!fn) throw new Error(`Unknown operator: ${name}`);
    return fn;
  },

  has(name) {
    return registry.get(name) !== undefined;
  },

  remove(name) {
    return staticOps.delete(name);
  },

  clear() {
    staticOps.clear();
    dynamicOps.length = 0;
  },

  setDynamic(pattern, factory) {
    dynamicOps.push({ pattern, factory });
  },
};
