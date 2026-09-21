# jth-compiler

[![npm version](https://img.shields.io/npm/v/%40johnhenry%2Fjth-compiler.svg)](https://www.npmjs.com/package/@johnhenry/jth-compiler)
[![license](https://img.shields.io/npm/l/%40johnhenry%2Fjth-compiler.svg)](../../LICENSE)

> Previously published as `jth-compiler@0.4.0`.

Compiler pipeline for the jth language. Transforms jth source code into executable JavaScript through three stages: lexing, parsing, and code generation.

## Installation

```bash
npm install @johnhenry/jth-compiler
```

## API

### `transform(source, options?) -> string`

Convenience pipeline that runs all three stages in sequence. Returns JavaScript source code.

Options:
- `preamble` (boolean, default `true`) -- when `true`, emits import boilerplate for `@johnhenry/jth-runtime` and `@johnhenry/jth-stdlib` and a `const stack = new Stack()` declaration at the top of the output.

### `lex(source) -> Token[]`

Tokenize jth source code. Each token has `{ type, value, line, column }`.

Token types include: `NUMBER`, `STRING`, `BOOLEAN`, `NULL`, `UNDEFINED`, `OPERATOR`, `IDENTIFIER`, `SEMICOLON`, `BLOCK_OPEN`, `BLOCK_CLOSE`, `ARRAY_OPEN`, `ARRAY_CLOSE`, `OBJECT_OPEN`, `PAREN_OPEN`, `PAREN_CLOSE`, `INLINE_JS`, `DEFINITION`, `VALUE_DEFINITION`, `IMPORT`, `EXPORT`, `COMMENT`, `EOF`.

### `parse(tokens) -> AST`

Parse tokens into an AST rooted at a `Program` node containing `Statement` nodes.

AST node types: `Program`, `Statement`, `NumberLiteral`, `StringLiteral`, `BooleanLiteral`, `NullLiteral`, `UndefinedLiteral`, `OperatorCall` (with optional `args` for configured operators), `BlockLiteral`, `ArrayLiteral`, `JSObjectLiteral`, `InlineJSExpression`, `Definition`, `ValueDefinition`, `Import`, `Export`.

### `generate(ast, options?) -> string`

Emit JavaScript source from an AST. Accepts the same `preamble` option as `transform`. Compiled output uses `processN` calls against a `Stack` instance with operators resolved from the global `registry`.

### `run(source, options?) -> Promise<{ stack, value, output }>`

Compile and execute jth source in one call -- `transform` (without a preamble) wrapped in a `new Function` and run as an async IIFE. This is the single shared execution pipeline: every in-process consumer (`jth-repl`'s evaluator, `jth-eval`'s `evalJth`/`JthContext`, the e2e test helper) runs through `run()`, and it owns the only `new Function` execution site for jth programs in the codebase.

`run()` does **not** register the standard library -- callers that want stdlib words must `import "@johnhenry/jth-stdlib"` themselves, or pass a pre-populated `registry`.

Options:
- `registry` (`RegistryLike`, default the global `jth-runtime` registry) -- registry operators resolve against, e.g. a sandboxed `ScopedRegistry`.
- `stack` (`Stack`, default a fresh `Stack`) -- stack to execute against; persistent consumers (REPL, `JthContext`) pass their own to preserve state across calls.
- `timeoutMs` (number, default `0`) -- max execution time in ms; `0` disables the timeout. On timeout, rejects with `Evaluation timed out after ${timeoutMs}ms`.
- `captureLog` (boolean, default `false`) -- capture `console.log` output emitted during execution instead of letting it print, returned as `output`.
- `forbidInlineJS` (boolean, default `false`) -- reject inline JS (`((...))`) at compile time with `OP_NOT_ALLOWED`. Sandboxed consumers (`jth-eval`) set this, since inline JS trivially escapes any operator allowlist.

Returns a `RunResult`:
- `stack` -- the same `Stack` instance the program ran against.
- `value` -- the top of the stack after execution (`undefined` if empty).
- `output` -- captured `console.log` lines joined with `\n` (`""` unless `captureLog` was set).

```js
import { run } from "@johnhenry/jth-compiler";
import "@johnhenry/jth-stdlib"; // registers stdlib words on the global registry

const { value, output } = await run('1 2 + peek;', { captureLog: true });
console.log(value);  // 3
console.log(output); // "3" (from `peek`)
```

## Usage

```js
import { lex, parse, generate, transform } from "@johnhenry/jth-compiler";

// Full pipeline (one step)
const js = transform('1 2 + peek;', { preamble: true });
console.log(js);

// Stage by stage
const tokens = lex('1 2 + peek;');
const ast    = parse(tokens);
const code   = generate(ast, { preamble: false });
console.log(code);
// => await processN(stack, [1, 2, registry.resolve("+"), registry.resolve("peek")]);
```

---

See the root [README](../../README.md) for full jth language documentation.
