import { op, variadic, processN } from "jth-runtime";
import { Stack } from "jth-runtime";
import { JthRuntimeError } from "jth-types";
import { MAX_ITERATIONS } from "./control-flow.ts";

// push: push item onto array (bottom=arr, top=item)
export const push = op(2)((arr, item) => {
  if (Array.isArray(arr)) {
    arr.push(item);
    return [arr];
  }
  return [arr, item];
});

// pop: pop item from array
export const pop = op(1)((arr) => {
  if (Array.isArray(arr)) {
    const item = arr.pop();
    return [arr, item];
  }
  return [arr];
});

// shift: shift from array
export const shift = op(1)((arr) => {
  if (Array.isArray(arr)) {
    const item = arr.shift();
    return [arr, item];
  }
  return [arr];
});

// unshift: unshift onto array
export const unshift = op(2)((arr, item) => {
  if (Array.isArray(arr)) {
    arr.unshift(item);
    return [arr];
  }
  return [arr, item];
});

// suppose: add to collection (FIX BUG: old code had stack.pop without ())
export const suppose = op(2)((collection, item) => {
  if (Array.isArray(collection)) {
    collection.push(item);
    return [collection];
  }
  if (collection instanceof Set) {
    collection.add(item);
    return [collection];
  }
  if (collection instanceof Map) {
    collection.set(item, item);
    return [collection];
  }
  return [collection, item];
});

// flatten: flatten arrays
export const flatten = variadic((...args) => {
  const flat: unknown[] = [];
  const doFlat = (items: unknown[]) => {
    for (const item of items) {
      if (Array.isArray(item)) doFlat(item);
      else flat.push(item);
    }
  };
  doFlat(args);
  return flat;
});

// ── Block runner ─────────────────────────────────────────────────────
// Each element gets its own isolated Stack; the block runs against it via
// processN, so thenable results are detected/awaited with exactly the same
// sync-fast-path / async-promotion semantics as the rest of the language.
// Returns the isolated stack, or a Promise of it if the block was async.
const runBlock = (block: unknown, ...seed: unknown[]): Stack | Promise<Stack> => {
  const s = new Stack();
  s.push(...seed);
  if (typeof block !== "function") return s;
  return processN(s, [block]) as Stack | Promise<Stack>;
};

const isThenable = (v: unknown): v is Promise<Stack> =>
  !!v && typeof (v as Promise<unknown>).then === "function";

// map: [array] #[ block ] map -- apply block to each element, return new array
// Block-aware: each element gets its own isolated Stack. Sync unless a
// block turns out to be async, in which case a Promise is returned.
export const mapOp = (stack: Stack): void | Promise<void> => {
  const block = stack.pop();
  const arr = stack.pop() as any[];
  const result: unknown[] = [];
  for (let i = 0; i < arr.length; i++) {
    const r = runBlock(block, arr[i]);
    if (isThenable(r)) {
      // Async promotion: finish this element and the rest asynchronously
      return (async () => {
        result.push((await r).pop());
        for (i++; i < arr.length; i++) {
          result.push((await runBlock(block, arr[i])).pop());
        }
        stack.push(result);
      })();
    }
    result.push(r.pop());
  }
  stack.push(result);
};

// filter: [array] #[ block ] filter -- keep elements where block returns truthy
// Block-aware: each element gets its own isolated Stack. Sync unless a
// block turns out to be async, in which case a Promise is returned.
export const filterOp = (stack: Stack): void | Promise<void> => {
  const block = stack.pop();
  const arr = stack.pop() as any[];
  const result: unknown[] = [];
  for (let i = 0; i < arr.length; i++) {
    const r = runBlock(block, arr[i]);
    if (isThenable(r)) {
      return (async () => {
        if ((await r).pop()) result.push(arr[i]);
        for (i++; i < arr.length; i++) {
          if ((await runBlock(block, arr[i])).pop()) result.push(arr[i]);
        }
        stack.push(result);
      })();
    }
    if (r.pop()) result.push(arr[i]);
  }
  stack.push(result);
};

// reduce: [array] init #[ block ] reduce -- accumulate over array with block
// Block-aware: each iteration gets its own isolated Stack with [acc, element].
// Sync unless a block turns out to be async, in which case a Promise is returned.
export const reduceOp = (stack: Stack): void | Promise<void> => {
  const block = stack.pop();
  const init = stack.pop();
  const arr = stack.pop() as any[];
  let acc = init;
  for (let i = 0; i < arr.length; i++) {
    const r = runBlock(block, acc, arr[i]);
    if (isThenable(r)) {
      return (async () => {
        acc = (await r).pop();
        for (i++; i < arr.length; i++) {
          acc = (await runBlock(block, acc, arr[i])).pop();
        }
        stack.push(acc);
      })();
    }
    acc = r.pop();
  }
  stack.push(acc);
};

// fold: alias for reduce (catamorphism over flat arrays)
export const foldOp = reduceOp;

// bend: seed #[ predicate ] #[ step ] bend -- unfold/anamorphism
// Produces an array from a seed value.
// predicate: given seed, returns truthy to continue
// step: given seed, should leave [value, nextSeed] on stack
// Capped at MAX_ITERATIONS (shared with while/until) so a non-terminating
// bend throws instead of hanging. Sync unless a block turns out to be
// async, in which case a Promise is returned.
export const bendOp = (stack: Stack): void | Promise<void> => {
  const step = stack.pop();
  const predicate = stack.pop();
  let seed = stack.pop();
  const result: unknown[] = [];

  const iterationLimit = () =>
    new JthRuntimeError(
      `bend exceeded ${MAX_ITERATIONS} iterations (non-terminating predicate?)`,
      undefined,
      undefined,
      "ITERATION_LIMIT"
    );

  // Applies one step result: pops [value, nextSeed], records value.
  const applyStep = (ss: Stack): void => {
    const nextSeed = ss.pop();
    const value = ss.pop();
    result.push(value);
    seed = nextSeed;
  };

  // Async continuation: same predicate/step logic, awaiting block results.
  const continueAsync = async (
    pending: Promise<Stack>,
    phase: "predicate" | "step",
    iterations: number
  ): Promise<void> => {
    for (;;) {
      if (phase === "predicate") {
        if (!(await pending).pop()) break;
        phase = "step";
        pending = Promise.resolve(runBlock(step, seed));
        continue;
      }
      applyStep(await pending);
      if (iterations++ >= MAX_ITERATIONS) throw iterationLimit();
      phase = "predicate";
      pending = Promise.resolve(runBlock(predicate, seed));
    }
    stack.push(result);
  };

  let iterations = 0;
  for (;;) {
    if (iterations++ >= MAX_ITERATIONS) throw iterationLimit();

    // Test predicate
    const pr = runBlock(predicate, seed);
    if (isThenable(pr)) return continueAsync(pr, "predicate", iterations);
    if (!pr.pop()) break;

    // Execute step
    const sr = runBlock(step, seed);
    if (isThenable(sr)) return continueAsync(sr, "step", iterations);
    applyStep(sr);
  }

  stack.push(result);
};
