import { getMeta, annotate } from "./meta.ts";
import type { Stack } from "./stack.ts";
import type { MetaAnnotations } from "jth-types";

type AnyFunction = (...args: unknown[]) => unknown;

/** A function item whose execution returned a Promise; completed after awaiting. */
interface PendingStep {
  promise: Promise<unknown>;
  fn: AnyFunction;
  meta: MetaAnnotations;
  saved: unknown[];
}

/**
 * When a step's execution returns a Promise, the step deposits the pending
 * work here instead of allocating a result object per item (keeps the sync
 * hot path allocation-free). The driver reads and clears it synchronously
 * immediately after each `step()` call, so interleaved async continuations
 * cannot observe each other's slot.
 */
let pendingSlot: PendingStep | null = null;

/**
 * Process a single queue item; returns the (possibly advanced) index.
 * This is the ONE place the meta-annotation queue-splicing logic
 * (skip/delay/limit/persist/rewind) lives; both the sync and async
 * drivers below call it.
 *
 * Fully synchronous: if executing the item returned a Promise, the
 * post-execution phase (restore/persist/rewind) is NOT run here — it is
 * left in `pendingSlot` for the driver to finish after awaiting.
 */
function step(stack: Stack, arr: unknown[], i: number): number {
  const raw = arr[i];

  if (typeof raw !== "function") {
    stack.push(raw);
    return i;
  }

  const meta = getMeta(raw as AnyFunction);

  // skip: push next N items as values (not executed as functions)
  if (meta.skip !== undefined) {
    const n = meta.skip === -1 ? arr.length - i - 1 : meta.skip;
    for (let j = 0; j < n && i + 1 < arr.length; j++) {
      stack.push(arr[++i]);
    }
  }

  // delay: re-insert with delay-1, do not execute yet
  if (meta.delay !== undefined && meta.delay > 0) {
    arr.splice(i + 1, 0, annotate(raw as AnyFunction, { ...meta, delay: meta.delay - 1 }));
    return i;
  }

  // limit: temporarily hide items beyond the limit
  let saved: unknown[] = [];
  if (meta.limit !== undefined && meta.limit >= 0) {
    const all = stack.toArray();
    stack.clear();
    if (meta.limit < all.length) {
      saved = all.splice(0, all.length - meta.limit);
    }
    stack.push(...all);
  }

  // Execute
  const result = (raw as AnyFunction)(stack);

  // If the result is a thenable, defer the post-execution phase until awaited
  if (result && typeof (result as Promise<unknown>).then === "function") {
    pendingSlot = { promise: result as Promise<unknown>, fn: raw as AnyFunction, meta, saved };
    return i;
  }

  finishStep(stack, arr, i, raw as AnyFunction, meta, saved);
  return i;
}

/**
 * Post-execution phase of a step: restore limit-hidden items, then apply
 * persist and rewind. Shared by the sync path (called immediately) and the
 * async path (called after awaiting the step's Promise).
 */
function finishStep(
  stack: Stack,
  arr: unknown[],
  i: number,
  fn: AnyFunction,
  meta: MetaAnnotations,
  saved: unknown[]
): void {
  // Restore saved items (at bottom of stack)
  if (saved.length) {
    const cur = stack.toArray();
    stack.clear();
    stack.push(...saved, ...cur);
  }

  // persist: re-add function with decremented persist count
  if (meta.persist !== undefined && meta.persist !== 0) {
    const next = meta.persist === -1 ? -1 : meta.persist - 1;
    arr.splice(i + 1, 0, annotate(fn, { ...meta, persist: next }));
  }

  // rewind: move items from stack back into the processing queue
  if (meta.rewind !== undefined) {
    const n = meta.rewind === -1 ? stack.length : meta.rewind;
    for (let j = 0; j < n && stack.length > 0; j++) {
      arr.splice(i + 1, 0, stack.pop());
    }
  }
}

/**
 * Process items against a stack. Sync by default (no Promise or microtask
 * on the hot path), auto-promotes to async the moment a function call
 * returns a Promise.
 */
export function processN(stack: Stack, items: Iterable<unknown>): Stack | Promise<Stack> {
  const arr = [...items];

  for (let i = 0; i < arr.length; i++) {
    i = step(stack, arr, i);
    if (pendingSlot) {
      const pending = pendingSlot;
      pendingSlot = null;
      return processNAsync(stack, arr, i, pending);
    }
  }

  return stack;
}

/**
 * Async continuation: awaits the pending step, finishes it, then keeps
 * driving the SAME `step` logic (awaiting any further Promises).
 */
async function processNAsync(
  stack: Stack,
  arr: unknown[],
  idx: number,
  pending: PendingStep
): Promise<Stack> {
  await pending.promise;
  finishStep(stack, arr, idx, pending.fn, pending.meta, pending.saved);

  for (let i = idx + 1; i < arr.length; i++) {
    i = step(stack, arr, i);
    if (pendingSlot) {
      const p = pendingSlot;
      pendingSlot = null;
      await p.promise;
      finishStep(stack, arr, i, p.fn, p.meta, p.saved);
    }
  }

  return stack;
}
