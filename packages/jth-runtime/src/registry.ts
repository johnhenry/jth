import { JthRuntimeError } from "@johnhenry/jth-types";
import type { StackOperator } from "./op.ts";

/** Levenshtein distance, used to suggest the nearest known operator. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      prev = tmp;
    }
  }
  return row[n];
}

/** Find the closest registered operator name (edit distance <= 2), if any. */
function suggestOperator(name: string): string | undefined {
  let best: string | undefined;
  let bestDist = 3; // only suggest reasonably close names
  for (const known of staticOps.keys()) {
    const d = editDistance(name, known);
    if (d < bestDist) {
      bestDist = d;
      best = known;
    }
  }
  return best;
}

type DynamicFactory = (name: string, pattern: RegExp) => StackOperator | undefined;

const staticOps = new Map<string, StackOperator>();
const dynamicOps: Array<{ pattern: RegExp; factory: DynamicFactory }> = [];

export const registry = {
  set(name: string, fn: StackOperator) {
    staticOps.set(name, fn);
  },

  get(name: string): StackOperator | undefined {
    if (staticOps.has(name)) return staticOps.get(name);
    for (const { pattern, factory } of dynamicOps) {
      if (pattern.test(name)) return factory(name, pattern);
    }
    return undefined;
  },

  resolve(name: string): StackOperator {
    const fn = registry.get(name);
    if (!fn) {
      const suggestion = suggestOperator(name);
      const hint = suggestion ? ` (did you mean "${suggestion}"?)` : "";
      throw new JthRuntimeError(
        `Unknown operator: ${name}${hint}`,
        undefined,
        undefined,
        "UNKNOWN_OPERATOR"
      );
    }
    return fn;
  },

  has(name: string): boolean {
    return registry.get(name) !== undefined;
  },

  /**
   * Enumerate the names of all registered static operators.
   * Dynamic pattern ops (setDynamic) match open-ended name families
   * (e.g. "3+", "2log") and have no fixed names, so they are NOT
   * included — use dynamicPatterns() to inspect those.
   */
  names(): string[] {
    return [...staticOps.keys()];
  },

  /**
   * The patterns of all registered dynamic operator factories.
   */
  dynamicPatterns(): RegExp[] {
    return dynamicOps.map((d) => d.pattern);
  },

  remove(name: string): boolean {
    return staticOps.delete(name);
  },

  clear() {
    staticOps.clear();
    dynamicOps.length = 0;
  },

  setDynamic(pattern: RegExp, factory: DynamicFactory) {
    dynamicOps.push({ pattern, factory });
  },
};
