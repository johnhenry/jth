/**
 * Shared interface documentation and constants for jth.
 *
 * StackOperator: A function that either:
 *   (a) Takes (stack: Stack) => void  (mutates stack directly)
 *   (b) Takes (...args) => [...results]  (adapter pops/pushes automatically)
 *
 * OperatorRegistry:
 *   - set(name: string, fn: StackOperator): void
 *   - get(name: string): StackOperator | undefined
 *   - resolve(name: string): StackOperator  (throws if missing)
 *   - has(name: string): boolean
 *   - remove(name: string): boolean
 *   - clear(): void
 *   - setDynamic(pattern: RegExp, factory: (match, pattern) => StackOperator): void
 *
 * MetaAnnotations shape:
 *   { delay?: number, persist?: number, rewind?: number, skip?: number, limit?: number }
 */

/** Sentinel for "unlimited" in META fields (distinguishes from "unset") */
export const UNLIMITED = -1;

/** Symbol used for the calling-stack-function context (legacy compat) */
export const CALLING_CONTEXT = Symbol.for("JTH_CALLING_CONTEXT");
