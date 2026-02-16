import { getMeta, annotate } from "./meta.mjs";

/**
 * Process items against a stack. Sync by default, auto-promotes to async
 * when a Promise is detected from a function call.
 */
export function processN(stack, items) {
  const arr = Array.isArray(items) ? [...items] : [...items];

  for (let i = 0; i < arr.length; i++) {
    const raw = arr[i];

    if (typeof raw !== "function") {
      stack.push(raw);
      continue;
    }

    const meta = getMeta(raw);

    // skip: push next N items as values (not executed as functions)
    if (meta.skip !== undefined) {
      const n = meta.skip === -1 ? arr.length - i - 1 : meta.skip;
      for (let j = 0; j < n && i + 1 < arr.length; j++) {
        stack.push(arr[++i]);
      }
    }

    // delay: re-insert with delay-1, do not execute yet
    if (meta.delay !== undefined && meta.delay > 0) {
      arr.splice(i + 1, 0, annotate(raw, { ...meta, delay: meta.delay - 1 }));
      continue;
    }

    // limit: temporarily hide items beyond the limit
    let saved = [];
    if (meta.limit !== undefined && meta.limit >= 0) {
      const all = stack.toArray();
      stack.clear();
      if (meta.limit < all.length) {
        saved = all.splice(0, all.length - meta.limit);
      }
      stack.push(...all);
    }

    // Execute
    const result = raw(stack);

    // If result is a Promise, switch to async mode
    if (result && typeof result.then === "function") {
      return processNAsync(stack, arr, i, result, saved, meta, raw);
    }

    // Restore saved items (at bottom of stack)
    if (saved.length) {
      const cur = stack.toArray();
      stack.clear();
      stack.push(...saved, ...cur);
    }

    // persist: re-add function with decremented persist count
    if (meta.persist !== undefined && meta.persist !== 0) {
      const next = meta.persist === -1 ? -1 : meta.persist - 1;
      arr.splice(i + 1, 0, annotate(raw, { ...meta, persist: next }));
    }

    // rewind: move items from stack back into the processing queue
    if (meta.rewind !== undefined) {
      const n = meta.rewind === -1 ? stack.length : meta.rewind;
      for (let j = 0; j < n && stack.length > 0; j++) {
        arr.splice(i + 1, 0, stack.pop());
      }
    }
  }

  return stack;
}

async function processNAsync(stack, arr, idx, promise, saved, meta, fn) {
  await promise;

  // Restore saved items for the function that went async
  if (saved.length) {
    const cur = stack.toArray();
    stack.clear();
    stack.push(...saved, ...cur);
  }

  // persist for the async function
  if (meta.persist !== undefined && meta.persist !== 0) {
    const next = meta.persist === -1 ? -1 : meta.persist - 1;
    arr.splice(idx + 1, 0, annotate(fn, { ...meta, persist: next }));
  }

  // rewind for the async function
  if (meta.rewind !== undefined) {
    const n = meta.rewind === -1 ? stack.length : meta.rewind;
    for (let j = 0; j < n && stack.length > 0; j++) {
      arr.splice(idx + 1, 0, stack.pop());
    }
  }

  // Continue processing remaining items in async mode
  for (let i = idx + 1; i < arr.length; i++) {
    const raw = arr[i];

    if (typeof raw !== "function") {
      stack.push(raw);
      continue;
    }

    const itemMeta = getMeta(raw);

    if (itemMeta.skip !== undefined) {
      const n = itemMeta.skip === -1 ? arr.length - i - 1 : itemMeta.skip;
      for (let j = 0; j < n && i + 1 < arr.length; j++) {
        stack.push(arr[++i]);
      }
    }

    if (itemMeta.delay !== undefined && itemMeta.delay > 0) {
      arr.splice(
        i + 1,
        0,
        annotate(raw, { ...itemMeta, delay: itemMeta.delay - 1 })
      );
      continue;
    }

    let localSaved = [];
    if (itemMeta.limit !== undefined && itemMeta.limit >= 0) {
      const all = stack.toArray();
      stack.clear();
      if (itemMeta.limit < all.length) {
        localSaved = all.splice(0, all.length - itemMeta.limit);
      }
      stack.push(...all);
    }

    const result = raw(stack);
    if (result && typeof result.then === "function") await result;

    if (localSaved.length) {
      const cur = stack.toArray();
      stack.clear();
      stack.push(...localSaved, ...cur);
    }

    if (itemMeta.persist !== undefined && itemMeta.persist !== 0) {
      const next = itemMeta.persist === -1 ? -1 : itemMeta.persist - 1;
      arr.splice(i + 1, 0, annotate(raw, { ...itemMeta, persist: next }));
    }

    if (itemMeta.rewind !== undefined) {
      const n = itemMeta.rewind === -1 ? stack.length : itemMeta.rewind;
      for (let j = 0; j < n && stack.length > 0; j++) {
        arr.splice(i + 1, 0, stack.pop());
      }
    }
  }

  return stack;
}
