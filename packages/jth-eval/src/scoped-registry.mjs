import { registry } from "jth-runtime";

/**
 * ScopedRegistry wraps the global registry with a local overlay.
 * All writes go to the local map; reads check local first, then fall back
 * to the global registry. Sandbox mode filters global fallback through an allowlist.
 */
export class ScopedRegistry {
  #local = new Map();
  #dynamicLocal = [];
  #allowlist = null; // null = no filtering, Set = only these names allowed from global

  /**
   * @param {object} [options]
   * @param {Set<string>|null} [options.allowlist] - If set, only these operator names
   *   are allowed to resolve from the global registry. null = allow all.
   */
  constructor(options = {}) {
    if (options.allowlist) {
      this.#allowlist = options.allowlist;
    }
  }

  /**
   * Register an operator in the local scope.
   */
  set(name, fn) {
    this.#local.set(name, fn);
  }

  /**
   * Get an operator. Checks local first, then global (with allowlist filtering).
   * Returns undefined if not found.
   */
  get(name) {
    if (this.#local.has(name)) return this.#local.get(name);

    // Check local dynamic patterns
    for (const { pattern, factory } of this.#dynamicLocal) {
      if (pattern.test(name)) return factory(name, pattern);
    }

    // Fall through to global, respecting allowlist
    if (this.#allowlist && !this.#allowlist.has(name)) {
      return undefined;
    }
    return registry.get(name);
  }

  /**
   * Get an operator or throw if not found.
   */
  resolve(name) {
    const fn = this.get(name);
    if (!fn) {
      if (this.#allowlist && !this.#allowlist.has(name) && registry.has(name)) {
        throw new Error(`Operator not allowed in sandbox: ${name}`);
      }
      throw new Error(`Unknown operator: ${name}`);
    }
    return fn;
  }

  /**
   * Check if an operator exists (local or allowed global).
   */
  has(name) {
    return this.get(name) !== undefined;
  }

  /**
   * Remove an operator from the local scope only.
   */
  remove(name) {
    return this.#local.delete(name);
  }

  /**
   * Register a dynamic pattern in the local scope.
   */
  setDynamic(pattern, factory) {
    this.#dynamicLocal.push({ pattern, factory });
  }

  /**
   * Clear the local scope only. Does not affect global registry.
   */
  clear() {
    this.#local.clear();
    this.#dynamicLocal.length = 0;
  }
}
