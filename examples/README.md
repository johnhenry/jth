# Examples

Run any of these with the built CLI from the repo root (`npm run build` first):
`npm run example:NN` for one, `npm run examples` for all in order.

| File | What it shows |
|------|---------------|
| [`01-hello.jth`](./01-hello.jth) | Hello World — push a string, `peek` it |
| [`02-arithmetic.jth`](./02-arithmetic.jth) | Arithmetic operators, chaining, `abs`/`sqrt`/`floor`/`ceil` |
| [`03-arrays.jth`](./03-arrays.jth) | Array literals, `push`/`pop`/`shift`/`unshift`, spread, `collect`, `map`/`filter`/`reduce`/`fold`/`bend` |
| [`04-definitions.jth`](./04-definitions.jth) | `:name` custom operators and constants; operators calling operators |
| [`05-dynamic-ops.jth`](./05-dynamic-ops.jth) | Number-prefixed dynamic operators (`3+`, `2log`, …) and their `N op x` semantics |
| [`06-error-handling.jth`](./06-error-handling.jth) | `try` / `throw` / `error?`, branching on failure |
| [`07-fibonacci.jth`](./07-fibonacci.jth) | The `fibonacci` step operator with the `swap drop` trim idiom |
| [`08-factorial.jth`](./08-factorial.jth) | Iterative factorial via `times` and variadic `Π` |
| [`09-fizzbuzz.jth`](./09-fizzbuzz.jth) | FizzBuzz with `if`/`elseif`/`else` chaining |
| [`10-statistics.jth`](./10-statistics.jth) | Variadic statistics: `mean`/`median`/`mode`/`modes`, `Σ`/`Π`, `min`/`max` |
| [`11-html.jth`](./11-html.jth) | Opt-in op package: `::import "@johnhenry/jth-html";` and the `h-*` HTML DSL |
