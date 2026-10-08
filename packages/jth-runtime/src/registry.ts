import { JthRuntimeError } from "@johnhenry/jth-types";
import type { OpArity, OpInfo, DynamicOpInfo } from "@johnhenry/jth-types";
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

/**
 * Operator function -> the name it was first registered under. Lets the
 * runtime driver attribute failures (e.g. stack underflow) to a jth
 * operator name. First registration wins, so aliases report the primary
 * name.
 */
const operatorNames = new WeakMap<object, string>();

/** Record `name` as the display name of `fn` (no-op if already named). */
export function nameOperator(fn: unknown, name: string): void {
  if (typeof fn === "function" && !operatorNames.has(fn)) operatorNames.set(fn, name);
}

/** The jth name `fn` was registered under, if any. */
export function operatorName(fn: unknown): string | undefined {
  return typeof fn === "function" ? operatorNames.get(fn) : undefined;
}

/** Registered documentation, keyed by name (static) and by pattern source (dynamic). */
const staticInfo = new Map<string, OpInfo>();
const dynamicInfo = new Map<string, DynamicOpInfo>();
const infoByFn = new WeakMap<object, OpInfo>();

/** Documentation for the operator function `fn`, if it was registered with any. */
export function operatorInfo(fn: unknown): OpInfo | undefined {
  return typeof fn === "function" ? infoByFn.get(fn) : undefined;
}

export interface StaticOpDoc {
  description: string;
  /** Defaults to the arity declared by op()/variadic(), else "varies". */
  arity?: OpArity;
}

function deriveArity(fn: StackOperator, declared?: OpArity): OpArity {
  if (declared !== undefined) return declared;
  const a = fn._arity;
  if (a === Infinity) return "variadic";
  return typeof a === "number" ? a : "varies";
}

type DynamicFactory = (name: string, pattern: RegExp) => StackOperator | undefined;

const staticOps = new Map<string, StackOperator>();
const dynamicOps: Array<{ pattern: RegExp; factory: DynamicFactory }> = [];

export const registry = {
  set(name: string, fn: StackOperator, doc?: StaticOpDoc) {
    staticOps.set(name, fn);
    nameOperator(fn, name);
    if (doc) {
      const info: OpInfo = { name, arity: deriveArity(fn, doc.arity), description: doc.description };
      staticInfo.set(name, info);
      if (!infoByFn.has(fn)) infoByFn.set(fn, info);
    } else {
      // Re-registering a name without docs must not leave stale docs behind.
      staticInfo.delete(name);
    }
  },

  /** Documentation registered for a static operator name. */
  info(name: string): OpInfo | undefined {
    return staticOps.has(name) ? staticInfo.get(name) : undefined;
  },

  /** Documentation for every registered static operator that has some. */
  infos(): OpInfo[] {
    return [...staticOps.keys()].flatMap((n) => {
      const i = staticInfo.get(n);
      return i ? [i] : [];
    });
  },

  /** Documentation for registered dynamic operator families. */
  dynamicInfos(): DynamicOpInfo[] {
    return [...dynamicInfo.values()];
  },

  get(name: string): StackOperator | undefined {
    if (staticOps.has(name)) return staticOps.get(name);
    for (const { pattern, factory } of dynamicOps) {
      if (pattern.test(name)) {
        const made = factory(name, pattern);
        nameOperator(made, name);
        return made;
      }
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
    staticInfo.delete(name);
    return staticOps.delete(name);
  },

  clear() {
    staticOps.clear();
    staticInfo.clear();
    dynamicInfo.clear();
    dynamicOps.length = 0;
  },

  setDynamic(pattern: RegExp, factory: DynamicFactory, doc?: DynamicOpInfo) {
    dynamicOps.push({ pattern, factory });
    if (doc) dynamicInfo.set(pattern.source, doc);
  },
};
