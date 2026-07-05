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
