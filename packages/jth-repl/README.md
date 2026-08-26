# jth-repl

> Previously published as `jth-repl@0.4.0`.

Interactive REPL (Read-Eval-Print Loop) for the jth language. Maintains a persistent stack across inputs so you can build up computations interactively.

## Installation

```bash
npm install @johnhenry/jth-repl
```

## Starting the REPL

```js
import { startRepl } from "@johnhenry/jth-repl";

startRepl();
```

When launched you will see the `jth>` prompt. Type jth expressions and press Enter. The full stack contents are printed after each evaluation.

## Dot-Commands

| Command  | Description                               |
|----------|-------------------------------------------|
| `.help`  | List available dot-commands               |
| `.peek`  | Print the top stack value                 |
| `.count` | Print the number of items on the stack    |
| `.stack` | Print the full stack as an array          |
| `.clear` | Remove all items from the stack           |
| `.exit`  | Quit the REPL (also `.quit`)             |

## Session Example

```
jth 2.0 REPL. Type .help for commands, .exit to quit.
jth> 1 2 3
[ 1, 2, 3 ]
jth> +
[ 1, 5 ]
jth> *
[ 5 ]
jth> .peek
5
jth> .clear
Stack cleared.
jth> .exit
```

## Programmatic Evaluator

The package also exports `createEvaluator()` for embedding jth evaluation in your own tools.

```js
import { createEvaluator } from "@johnhenry/jth-repl/evaluator";

const ev = createEvaluator();
await ev.evaluate("10 20 +;");
console.log(ev.peek());   // 30
console.log(ev.toArray()); // [30]
ev.clear();
```

The evaluator exposes: `evaluate(source)`, `peek()`, `toArray()`, `clear()`, `getStack()`, and a `length` getter.

## Sandboxing (opt-in)

**By default, `createEvaluator()` — and therefore `jth run -c` and the
interactive REPL — is unsandboxed.** Inline JS (`((...))`) runs with full
access to `process`, the filesystem, and the network, and every stdlib
operator is available. This is intentional for the default, local,
trusted-input use case (a developer running their own `.jth` files or
typing into their own REPL), but it means `createEvaluator()` must **not**
be used to evaluate untrusted jth source as-is.

For untrusted input, pass a `sandbox` option — this routes evaluation
through [`@johnhenry/jth-eval`](../jth-eval)'s `JthContext` instead of the
raw compiler pipeline, rejecting inline JS and `::name` value-definitions
at compile time and filtering operator resolution through an allowlist:

```js
import { createEvaluator } from "@johnhenry/jth-repl/evaluator";

// true = bare mode (only explicitly-injected values/operators)
// "restricted" = full stdlib minus I/O ops (peek, peek-all)
// string[] = an explicit operator allowlist
const ev = createEvaluator({ sandbox: "restricted" });

await ev.evaluate("1 2 +;");        // ok — pure arithmetic
await ev.evaluate("((s) => {}));"); // rejected: OP_NOT_ALLOWED
await ev.evaluate("peek;");         // rejected: OP_NOT_ALLOWED (I/O)
```

In sandboxed mode, `getStack()` returns a fresh `Stack` snapshot on each
call (rather than a single live, mutated-in-place instance) since
`JthContext` does not expose its internal stack directly.

Each `createEvaluator()` instance also gets its own isolated operator
registry regardless of sandbox mode — `:name` definitions in one evaluator
are never visible to another evaluator in the same process.

Note: there is currently no CLI flag to opt the interactive `jth repl` or
`jth run -c` into sandboxed mode — this option is only available when
embedding `createEvaluator()` programmatically. Wiring a CLI flag through
is tracked as a follow-up.

---

See the root [README](../../README.md) for full jth language documentation.
