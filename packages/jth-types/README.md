# jth-types

> Previously published as `jth-types@0.4.0`.

Shared type contract for the jth language: token definitions, AST node interfaces and constructors, meta-annotation interfaces, and the error hierarchy. This package is the single source of truth imported by `@johnhenry/jth-compiler` (lexer/parser/codegen) and `@johnhenry/jth-runtime` — it has no dependencies of its own.

## Installation

```bash
npm install @johnhenry/jth-types
```

## Public exports

| Subpath | Contents |
|---------|----------|
| `@johnhenry/jth-types` (root) | Re-exports everything below |
| `@johnhenry/jth-types/tokens` | `TokenType` (frozen enum of lexer token kinds), `token()` constructor, `Token` / `TokenTypeValue` types |
| `@johnhenry/jth-types/ast` | AST node constructors and their TypeScript interfaces (see below) |
| `@johnhenry/jth-types/errors` | `JthError` hierarchy |
| `@johnhenry/jth-types/interfaces` | `MetaAnnotations` (delay/persist/rewind/skip/limit), `UNLIMITED` sentinel |

### AST nodes

Constructors (each returns a plain object with a `type` field plus `line`/`column`):
`ProgramNode`, `NumberLiteral`, `StringLiteral`, `BooleanLiteral`, `NullLiteral`, `UndefinedLiteral`, `OperatorCallNode`, `ArrayLiteral`, `BlockLiteral`, `JSObjectLiteral`, `InlineJSExpression`, `DefinitionNode`, `ValueDefinitionNode`, `ImportNode`, `ExportNode`, `StatementNode`.

Matching interfaces are exported with a `Type` suffix (e.g. `NumberLiteralType`, `ProgramNodeType`), plus the `ASTNode` union and `JSObjectProperty`.

### Errors

All errors carry a source position (`line` / `column`, `null` when unknown):

```
JthError
├── JthLexerError
├── JthParserError
└── JthRuntimeError   (adds machine-readable `code`, e.g. "UNKNOWN_OPERATOR",
                       "ITERATION_LIMIT", "OP_NOT_ALLOWED")
```

## Example

```ts
import { JthRuntimeError, TokenType } from "@johnhenry/jth-types";
import { NumberLiteral } from "@johnhenry/jth-types/ast";

const node = NumberLiteral(42, 1, 0);
// { type: "NumberLiteral", value: 42, line: 1, column: 0 }

throw new JthRuntimeError("Unknown operator: foo", 3, 7, "UNKNOWN_OPERATOR");
```

## Notes

- The package is types + tiny constructors only; there is no runtime logic here.
- Some AST constructors are consumed only by the parser (`@johnhenry/jth-compiler`); all are exported so external tooling can build jth ASTs programmatically.
