// Simulates a browser/Worker bundle: `node:async_hooks` is replaced by a shim
// whose AsyncLocalStorage only keeps the store for the synchronous part of run().
import { registerHooks } from "node:module";

const shim = `
export class AsyncLocalStorage {
  #store;
  run(store, fn, ...args) {
    const prev = this.#store;
    this.#store = store;
    try { return fn(...args); } finally { this.#store = undefined; }
  }
  getStore() { return this.#store; }
}`;

registerHooks({
  resolve(specifier, context, next) {
    if ((specifier === "node:async_hooks" || specifier === "async_hooks") && context.parentURL?.includes("jth-runtime")) {
      return { url: "data:text/javascript," + encodeURIComponent(shim), shortCircuit: true };
    }
    return next(specifier, context);
  },
});
