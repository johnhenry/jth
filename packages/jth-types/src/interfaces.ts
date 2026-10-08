/**
 * Shared interface documentation and constants for jth.
 */

/**
 * Number of stack items an operator consumes: a fixed count, "variadic"
 * (consumes the whole stack), or "varies" (depends on the stack/blocks).
 */
export type OpArity = number | "variadic" | "varies";

/** Documentation for one registered static operator. */
export interface OpInfo {
  name: string;
  arity: OpArity;
  description: string;
}

/** Documentation for a family of dynamically-matched operators (e.g. `N+`). */
export interface DynamicOpInfo {
  /** Human-readable syntax, e.g. "N+". */
  syntax: string;
  arity: OpArity;
  description: string;
}

export interface MetaAnnotations {
  delay?: number;
  persist?: number;
  rewind?: number;
  skip?: number;
  limit?: number;
  /**
   * Only present on getMeta() of a registered operator: its registry
   * description/arity (see OpInfo). Never consumed by the stack machine.
   */
  description?: string;
  arity?: OpArity;
}

/** Sentinel for "unlimited" in META fields (distinguishes from "unset") */
export const UNLIMITED = -1;
