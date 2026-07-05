# jth-eval

Embeddable jth evaluation for JavaScript hosts: one-shot `evalJth()`, a persistent `JthContext`, and a `ScopedRegistry` that lets each evaluation define/override operators without touching the global registry. Execution goes through the shared `jth-compiler` `run()` pipeline.

## Installation

```bash
npm install jth-eval
```

## `evalJth(code, options?)`

One-shot evaluation. Returns `{ value, stack, output }` — top of stack, full stack array, and captured `console.log` output.

```ts
import { evalJth } from "jth-eval";

const { value } = await evalJth("1 2 +;");            // 3
const r = await evalJth("x y +;", { values: { x: 10, y: 20 } }); // 30
```

Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `values` | `Record<string, unknown>` | `{}` | Injected as zero-arity operators |
| `operators` | `Record<string, StackOperator>` | `{}` | Custom operators (build with `op(arity)(fn)` from jth-runtime) |
| `stack` | `unknown[]` | `[]` | Pre-load the stack |
| `timeout` | `number` | `5000` | Max execution time in ms (rejects on expiry) |
| `sandbox` | `boolean \| "restricted" \| string[]` | `false` | See below |
| `captureOutput` | `boolean` | `true` | Capture `console.log` into `result.output` |

## Sandbox modes

| Value | Meaning |
|-------|---------|
| `false` | Full access to every registered operator |
| `true` | Bare mode: only injected `values`/`operators` resolve; all stdlib blocked |
| `"restricted"` | **Currently a no-op** — grants full access (see limitation below) |
| `string[]` | Explicit allowlist of global operator names |

Blocked operators throw `JthRuntimeError` (`code: "SANDBOX_DENIED"`); unknown names throw `code: "UNKNOWN_OPERATOR"`.

> **Known limitation ([#22](https://github.com/johnhenry/jth/issues/22)):** `"restricted"` mode does not yet restrict anything — the restricted-op set is empty and the mode falls back to full access. Inline JS (`((...))`) is also not blocked in any sandbox mode. Do not rely on the sandbox for isolation of untrusted code yet.

## `JthContext`

Persistent stack + registry across multiple `eval()` calls.

```ts
import { JthContext } from "jth-eval";

const ctx = new JthContext({ timeout: 2000 });
await ctx.eval("1 2 +;");
await ctx.eval("10 *;");
ctx.pop();               // 30
ctx.define("pi", 3.14159);          // named value
ctx.defineOp("add", 2, (a, b) => a + b); // custom op
ctx.dispose();           // further use throws CONTEXT_DISPOSED
```

Also on the context: `push(...)`, `pop()`, `peek()`, `clear()`, `toArray()`, `length`.

## `ScopedRegistry`

Local overlay over the global operator registry: writes stay local, reads fall back to global (optionally filtered through an allowlist). Useful for building your own evaluation environments.

```ts
import { ScopedRegistry } from "jth-eval";
const reg = new ScopedRegistry({ allowlist: new Set(["+", "-"]) });
```

## Notes

- Importing `jth-eval` loads `jth-stdlib` (registers the standard library globally).
- Timeouts use `Promise.race` — a timed-out evaluation rejects, but a hot synchronous loop cannot be preempted mid-statement.
