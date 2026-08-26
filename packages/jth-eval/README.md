# jth-eval

> Previously published as `jth-eval@0.4.0`.

Embeddable jth evaluation for JavaScript hosts: one-shot `evalJth()`, a persistent `JthContext`, and a `ScopedRegistry` that lets each evaluation define/override operators without touching the global registry. Execution goes through the shared `@johnhenry/jth-compiler` `run()` pipeline.

## Installation

```bash
npm install @johnhenry/jth-eval
```

## `evalJth(code, options?)`

One-shot evaluation. Returns `{ value, stack, output }` — top of stack, full stack array, and captured `console.log` output.

```ts
import { evalJth } from "@johnhenry/jth-eval";

const { value } = await evalJth("1 2 +;");            // 3
const r = await evalJth("x y +;", { values: { x: 10, y: 20 } }); // 30
```

Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `values` | `Record<string, unknown>` | `{}` | Injected as zero-arity operators |
| `operators` | `Record<string, StackOperator>` | `{}` | Custom operators (build with `op(arity)(fn)` from @johnhenry/jth-runtime) |
| `stack` | `unknown[]` | `[]` | Pre-load the stack |
| `timeout` | `number` | `5000` | Max execution time in ms (rejects on expiry) |
| `sandbox` | `boolean \| "restricted" \| string[]` | `false` | See below |
| `captureOutput` | `boolean` | `true` | Capture `console.log` into `result.output` |

## Sandbox modes

| Value | Meaning |
|-------|---------|
| `false` | Full access to every registered operator, inline JS allowed |
| `true` | Bare mode: only injected `values`/`operators` resolve; all stdlib blocked |
| `"restricted"` | All statically registered pure ops allowed; side-effecting ops blocked (see policy) |
| `string[]` | Explicit allowlist of global operator names |

Blocked operators throw `JthRuntimeError` with `code: "OP_NOT_ALLOWED"`; unknown names throw `code: "UNKNOWN_OPERATOR"`.

### Restricted-mode policy (default-deny)

- The allowlist is built by enumerating the registry (`registry.names()`) and removing `RESTRICTED_OPS` — the ops that touch the world outside the evaluation. In the default stdlib that is the console I/O pair **`peek` / `peek-all`**.
- **Inline JS (`((...))`) is rejected at compile time** in *every* sandbox mode (`true`, `"restricted"`, and array allowlists) — it would trivially escape any operator allowlist. The whole program is rejected before any statement runs.
- **Dynamic pattern ops** (`3+`, `2log`, `***`, …) are denied in restricted mode: patterns match open-ended name families and cannot be enumerated into an allowlist.

```ts
await evalJth("1 2 +;", { sandbox: "restricted" });      // ok → 3
await evalJth('"hi" peek;', { sandbox: "restricted" });  // throws OP_NOT_ALLOWED
await evalJth("((s)=>s.push(1));", { sandbox: "restricted" }); // throws OP_NOT_ALLOWED (compile time)
```

> The sandbox restricts which *operators* a program may call and blocks inline JS. It is not an OS-level isolation boundary: evaluation still runs in-process with host JS semantics (e.g. no memory limits, and a hot synchronous loop can only be cut off at statement boundaries by the timeout).

## `JthContext`

Persistent stack + registry across multiple `eval()` calls.

```ts
import { JthContext } from "@johnhenry/jth-eval";

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
import { ScopedRegistry } from "@johnhenry/jth-eval";
const reg = new ScopedRegistry({ allowlist: new Set(["+", "-"]) });
```

## Notes

- Importing `@johnhenry/jth-eval` loads `@johnhenry/jth-stdlib` (registers the standard library globally).
- Timeouts use `Promise.race` — a timed-out evaluation rejects, but a hot synchronous loop cannot be preempted mid-statement.
