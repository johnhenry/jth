import { AsyncLocalStorage } from "node:async_hooks";
import type { Stack } from "./stack.ts";

/**
 * Per-evaluation output capture.
 *
 * Operators that print (`peek`, `peek-all`) write through `emit()` instead
 * of calling console.log directly. Hosts that want to capture a run's output
 * wrap it in `captureOutput(sink, fn)`; the sink is scoped to that run's
 * async call tree via AsyncLocalStorage, so concurrent evaluations never see
 * each other's output and the global `console.log` is never replaced.
 *
 * AsyncLocalStorage is unreliable outside Node (browser/Worker shims lose the
 * store at the first `await`), so operators that have a stack should use
 * `emitTo(stack, ...)`, which prefers the sink attached explicitly to that
 * stack (`stack._sink`, inherited by `stack.child()`) and only then falls back
 * to the async-context sink.
 */
const sinks = new AsyncLocalStorage<(line: string) => void>();

/** Print to the active capture sink, or console.log when none is active. */
export function emit(...args: unknown[]): void {
  const sink = sinks.getStore();
  if (sink) {
    sink(args.map(String).join(" "));
  } else {
    console.log(...args);
  }
}

/** Run `fn` with all `emit()` output in its async call tree sent to `sink`. */
export function captureOutput<T>(sink: (line: string) => void, fn: () => T): T {
  return sinks.run(sink, fn);
}

/**
 * Like `emit`, but prefers the sink attached to `stack` (explicit per-run
 * scope, survives `await` in any environment) over the async-context sink.
 */
export function emitTo(stack: Stack, ...args: unknown[]): void {
  const sink = stack._sink;
  if (sink) {
    sink(args.map(String).join(" "));
  } else {
    emit(...args);
  }
}
