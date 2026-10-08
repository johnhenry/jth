import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-evaluation output capture.
 *
 * Operators that print (`peek`, `peek-all`) write through `emit()` instead
 * of calling console.log directly. Hosts that want to capture a run's output
 * wrap it in `captureOutput(sink, fn)`; the sink is scoped to that run's
 * async call tree via AsyncLocalStorage, so concurrent evaluations never see
 * each other's output and the global `console.log` is never replaced.
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
