# jth-runtime

Core runtime engine for the jth stack-based language. Provides the stack data structure, item processing pipeline, operator construction helpers, function metadata annotations, and a global operator registry.

## Installation

```bash
npm install jth-runtime
```

## API

### `Stack`

A private-data stack with standard operations.

| Method / Property   | Description                                      |
|---------------------|--------------------------------------------------|
| `push(...vals)`     | Push one or more values onto the stack            |
| `pop()`             | Remove and return the top value                   |
| `popN(n)`           | Pop `n` values, returned in original push order   |
| `peek()`            | Return the top value without removing it          |
| `peekN(n)`          | Return the top `n` values without removing them   |
| `swap()`            | Swap the top two values                           |
| `dup()`             | Duplicate the top value                           |
| `clone()`           | Create an independent copy of the entire stack    |
| `clear()`           | Remove all items                                  |
| `isEmpty()`         | Returns `true` if the stack has no items          |
| `length`            | (getter) Number of items on the stack             |
| `toArray()`         | Return a shallow copy as a plain array            |
| `[Symbol.iterator]` | Stack is iterable                                 |

### `processN(stack, items)`

Process an array of items against a stack. Non-function values are pushed; functions are executed with the stack as their argument. Automatically promotes to async when any function returns a Promise. Respects metadata annotations (skip, delay, limit, persist, rewind).

### `op(arity)`

Factory for creating fixed-arity stack operators. Returns a wrapper builder: call `op(n)(fn)` where `fn` receives `n` popped values and returns an array of values to push back.

### `variadic(fn)`

Create a variadic operator that consumes all stack items. `fn` receives every item as arguments and returns an array of values to push.

### `annotate(fn, meta)` / `getMeta(fn)`

Attach and read metadata on functions. Convenience wrappers: `delay(n)`, `persist(n)`, `rewind(n)`, `skip(n)`, `limit(n)`.

### `registry`

Global operator registry used by compiled jth programs.

| Method                        | Description                                          |
|-------------------------------|------------------------------------------------------|
| `set(name, fn)`               | Register a named operator                            |
| `get(name)`                   | Look up an operator (static then dynamic)            |
| `resolve(name)`               | Like `get` but throws if not found                   |
| `has(name)`                   | Returns `true` if the operator exists                |
| `remove(name)`                | Remove a static operator                             |
| `clear()`                     | Remove all static and dynamic operators              |
| `setDynamic(pattern, factory)`| Register a regex-based dynamic operator factory      |

## Usage

```js
import { Stack, processN, op, registry } from "jth-runtime";

// Build a simple add operator
const add = op(2)((a, b) => [a + b]);
registry.set("+", add);

// Process items against a stack
const stack = new Stack();
await processN(stack, [2, 3, registry.resolve("+")]);
console.log(stack.peek()); // 5
```

---

See the root [README](../../README.md) for full jth language documentation.
