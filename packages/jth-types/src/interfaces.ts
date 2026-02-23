/**
 * Shared interface documentation and constants for jth.
 */

export interface MetaAnnotations {
  delay?: number;
  persist?: number;
  rewind?: number;
  skip?: number;
  limit?: number;
}

/** Sentinel for "unlimited" in META fields (distinguishes from "unset") */
export const UNLIMITED = -1;

/** Symbol used for the calling-stack-function context (legacy compat) */
export const CALLING_CONTEXT = Symbol.for("JTH_CALLING_CONTEXT");
