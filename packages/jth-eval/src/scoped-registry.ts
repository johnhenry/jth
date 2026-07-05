import { registry } from "jth-runtime";
import type { StackOperator } from "jth-runtime";
import { JthRuntimeError } from "jth-types";

type DynamicFactory = (
  name: string,
  pattern: RegExp
) => StackOperator | undefined;

export interface ScopedRegistryOptions {
  /**
   * If set, only these operator names are allowed to resolve from the
   * global registry. null = allow all.
   */
  allowlist?: Set<string> | null;
}

/**
 * ScopedRegistry wraps the global registry with a local overlay.
 * All writes go to the local map; reads check local first, then fall back
 * to the global registry. Sandbox mode filters global fallback through an allowlist.
 */
export class ScopedRegistry {
  #local = new Map<string, StackOperator>();
  #dynamicLocal: Array<{ pattern: RegExp; factory: DynamicFactory }> = [];
  #allowlist: Set<string> | null = null; // null = no filtering, Set = only these names allowed from global

  constructor(options: ScopedRegistryOptions = {}) {
    if (options.allowlist) {
      this.#allowlist = options.allowlist;
    }
  }

  /**
   * Register an operator in the local scope.
   */
  set(name: string, fn: StackOperator): void {
    this.#local.set(name, fn);
  }

  /**
   * Get an operator. Checks local first, then global (with allowlist filtering).
   * Returns undefined if not found.
   */
  get(name: string): StackOperator | undefined {
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
  resolve(name: string): StackOperator {
    const fn = this.get(name);
    if (!fn) {
      if (this.#allowlist && !this.#allowlist.has(name) && registry.has(name)) {
        throw new JthRuntimeError(
          `Operator not allowed in sandbox: ${name}`,
          undefined,
          undefined,
          "SANDBOX_DENIED"
        );
      }
      throw new JthRuntimeError(
        `Unknown operator: ${name}`,
        undefined,
        undefined,
        "UNKNOWN_OPERATOR"
      );
    }
    return fn;
  }

  /**
   * Check if an operator exists (local or allowed global).
   */
  has(name: string): boolean {
    return this.get(name) !== undefined;
  }

  /**
   * Remove an operator from the local scope only.
   */
  remove(name: string): boolean {
    return this.#local.delete(name);
  }

  /**
   * Register a dynamic pattern in the local scope.
   */
  setDynamic(pattern: RegExp, factory: DynamicFactory): void {
    this.#dynamicLocal.push({ pattern, factory });
  }

  /**
   * Clear the local scope only. Does not affect global registry.
   */
  clear(): void {
    this.#local.clear();
    this.#dynamicLocal.length = 0;
  }
}
