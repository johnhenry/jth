# jth-stdlib

Standard library of operators for the jth language. Importing this package registers all built-in operators into the global `jth-runtime` registry.

## Installation

```bash
npm install jth-stdlib
```

## Operator Categories

| Category         | Examples                                           |
|------------------|----------------------------------------------------|
| Arithmetic       | `+`, `-`, `*`, `/`, `%`, `**`, `++`, `--`, etc.    |
| Stack            | `swap`, `dup`, `drop`, `over`, `rot`, `peek`, etc. |
| Comparison       | `=`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `<=>`, `eq?`, `lt?`, etc. |
| Logic            | `&&`, `\|\|`, `~~`, `not`, `xor`, `nand`, `nor`   |
| Control flow     | `if`, `elseif`, `else`, `times`, `while`, `until`, `break`, `when`, etc. |
| Error handling   | `try`, `throw`, `error?`                           |
| String           | `strcat`, `strseq`, `upper`, `lower`, `trim`, `len`, `starts?`, `ends?` |
| Type             | `typeof`, `number?`, `string?`, `array?`, `nil?`, `empty?`, `contains?` |
| Array            | `push`, `pop`, `shift`, `unshift`, `map`, `filter`, `reduce`, `fold`, `bend` |
| Dictionary       | `keys`, `values`, `entries`, `merge`, `record`     |
| Serialization    | `into-json`, `from-json`, `into-lines`, `from-lines` |
| Combinators      | `each`, `fanout`, `zip`, `compose`                 |
| Async            | `_` (await), `__` (Promise.all)                    |
| Meta             | `$` (execute), `$$` (execute-spread), `<<-`, `->>`  |
| Iterator         | `iter`, `next`, `..` (exhaust)                     |
| Sequences        | `fibonacci`                                        |
| Statistics       | `mean`, `median`, `mode`, `modes`                  |
| Hyperoperations  | `***`, `****`, etc. (variadic hyperoperators)       |
| Dynamic          | Pattern-based operators (e.g., `2+`, `3*`)         |

## Usage

```js
// Simply import to register all operators
import "jth-stdlib";

// Operators are now available in the global registry
import { Stack, processN, registry } from "jth-runtime";

const stack = new Stack();
await processN(stack, [10, 3, registry.resolve("-")]);
console.log(stack.peek()); // 7
```

The standard library is automatically imported by compiled jth programs. You only need to import it explicitly when using `jth-runtime` directly from JavaScript.

---

See the root [README](../../README.md) for a complete operator reference and jth language documentation.
