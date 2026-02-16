# jth-stdlib

Standard library of operators for the jth language. Importing this package registers all built-in operators into the global `jth-runtime` registry.

## Installation

```bash
npm install jth-stdlib
```

## Operator Categories

| Category         | Examples                                           |
|------------------|----------------------------------------------------|
| Arithmetic       | `+`, `-`, `*`, `/`, `%`, `**`, etc.                |
| Stack            | `swap`, `dup`, `drop`, `over`, `rot`, etc.         |
| Comparison       | `==`, `<`, `>`, `<=`, `>=`, `<=>`, etc.            |
| Logic            | `&&`, `||`, `!`, etc.                              |
| Control flow     | `if`, `iif`, `while`, `times`, `each`, etc.        |
| Error handling   | `try`, `throw`, etc.                               |
| String           | `concat`, `split`, `upper`, `lower`, etc.          |
| Type             | `typeof`, `to-int`, `to-float`, `to-string`, etc.  |
| Array            | `sort`, `reverse`, `flatten`, `map`, `filter`, etc.|
| Dictionary       | `keys`, `values`, `get`, `assoc`, etc.             |
| Serialization    | `to-json`, `from-json`, etc.                       |
| Combinators      | `apply`, `compose`, `dip`, `bi`, etc.              |
| Async            | `await`, `promise`, etc.                           |
| Meta             | `@` (print), `$$` (stack dump), etc.               |
| Iterator         | `iter`, `next`, `take`, etc.                       |
| Sequences        | `range`, `iota`, `fibonacci`, etc.                 |
| Statistics       | `mean`, `median`, `stdev`, etc.                    |
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
