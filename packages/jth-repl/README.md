# jth-repl

Interactive REPL (Read-Eval-Print Loop) for the jth language. Maintains a persistent stack across inputs so you can build up computations interactively.

## Installation

```bash
npm install jth-repl
```

## Starting the REPL

```js
import { startRepl } from "jth-repl";

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
import { createEvaluator } from "jth-repl/evaluator";

const ev = createEvaluator();
await ev.evaluate("10 20 +;");
console.log(ev.peek());   // 30
console.log(ev.toArray()); // [30]
ev.clear();
```

The evaluator exposes: `evaluate(source)`, `peek()`, `toArray()`, `clear()`, `getStack()`, and a `length` getter.

---

See the root [README](../../README.md) for full jth language documentation.
