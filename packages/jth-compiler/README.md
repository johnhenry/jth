# jth-compiler

Compiler pipeline for the jth language. Transforms jth source code into executable JavaScript through three stages: lexing, parsing, and code generation.

## Installation

```bash
npm install jth-compiler
```

## API

### `transform(source, options?) -> string`

Convenience pipeline that runs all three stages in sequence. Returns JavaScript source code.

Options:
- `preamble` (boolean, default `true`) -- when `true`, emits import boilerplate for `jth-runtime` and `jth-stdlib` and a `const stack = new Stack()` declaration at the top of the output.

### `lex(source) -> Token[]`

Tokenize jth source code. Each token has `{ type, value, line, column }`.

Token types include: `NUMBER`, `STRING`, `BOOLEAN`, `NULL`, `UNDEFINED`, `OPERATOR`, `IDENTIFIER`, `SEMICOLON`, `BLOCK_OPEN`, `BLOCK_CLOSE`, `ARRAY_OPEN`, `ARRAY_CLOSE`, `OBJECT_OPEN`, `PAREN_OPEN`, `PAREN_CLOSE`, `INLINE_JS`, `DEFINITION`, `VALUE_DEFINITION`, `IMPORT`, `EXPORT`, `COMMENT`, `EOF`.

### `parse(tokens) -> AST`

Parse tokens into an AST rooted at a `Program` node containing `Statement` nodes.

AST node types: `Program`, `Statement`, `NumberLiteral`, `StringLiteral`, `BooleanLiteral`, `NullLiteral`, `UndefinedLiteral`, `OperatorCall` (with optional `args` for configured operators), `BlockLiteral`, `ArrayLiteral`, `JSObjectLiteral`, `InlineJSExpression`, `Definition`, `ValueDefinition`, `Import`, `Export`.

### `generate(ast, options?) -> string`

Emit JavaScript source from an AST. Accepts the same `preamble` option as `transform`. Compiled output uses `processN` calls against a `Stack` instance with operators resolved from the global `registry`.

## Usage

```js
import { lex, parse, generate, transform } from "jth-compiler";

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
