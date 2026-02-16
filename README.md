# jth

A stack-based programming language that compiles to JavaScript.

```jth
"Hello, World!" @;
```

In jth, values are pushed onto a stack. Operators pop their arguments off the stack, do their work, and push results back. It is a simple model that turns out to be surprisingly powerful.

## Quick Start

### Install

```bash
npm install -g jth-cli
```

### Run a program

```bash
jth run hello.jth
```

### Run inline code

```bash
jth run -c '2 3 + @;'
# Output: 5
```

### Compile to JavaScript

```bash
jth compile program.jth output.mjs
```

### Start the REPL

```bash
jth
```

REPL dot-commands: `.help`, `.peek`, `.count`, `.clear`, `.stack`, `.exit`

---

## Language Tutorial

### Values and the Stack

Every value you write gets pushed onto the stack:

```jth
42;       // stack: [42]
"hello";  // stack: [42, "hello"]
true;     // stack: [42, "hello", true]
```

The `@` operator peeks at the top of the stack and logs it without removing it. The `@@` operator logs the entire stack.

```jth
42 @;     // logs: 42, stack: [42]
1 2 3 @@; // logs: 1 2 3, stack: [1, 2, 3]
```

Supported value types:

| Type        | Examples                         |
|-------------|----------------------------------|
| Numbers     | `1`, `3.14`, `0xFF`, `-5`        |
| Strings     | `"hello"`, `'world'`, `` `tmpl` `` |
| Booleans    | `true`, `false`                  |
| Null/Undef  | `null`, `undefined`              |
| Arrays      | `[1 2 3]` (space-separated)      |
| Objects     | `{ "key" "value" "k2" 42 }`     |

Semicolons separate statements.

### Arithmetic and Operators

Operators pop their arguments from the stack and push back the result:

```jth
2 3 +;   // stack: [5]       — pops 2 and 3, pushes 5
10 3 -;  // stack: [7]       — pops 10 and 3, pushes 7
4 5 *;   // stack: [20]
15 4 /;  // stack: [3.75]
17 5 %;  // stack: [2]       — modulo
2 8 **;  // stack: [256]     — exponentiation
```

You can chain operations. The stack carries values forward:

```jth
2 3 + 4 *;  // (2 + 3) * 4 = 20, stack: [20]
```

### Stack Manipulation

These operators rearrange what is on the stack:

```jth
5 dupe;      // stack: [5, 5]       — duplicate the top
3 7 swap;    // stack: [7, 3]       — swap top two
1 2 3 drop;  // stack: [1, 2]       — discard the top
1 2 3 count; // stack: [1, 2, 3, 3] — push the stack depth
clear;       // stack: []           — empty the stack
```

`reverse` reverses the entire stack. `copy` duplicates the entire stack. `collect` gathers all items into an array.

### Blocks and Definitions

A block is an anonymous function wrapped in `#[ ]`. It operates on the stack when executed:

```jth
#[ dupe * ] :square;   // define "square" as an operator
5 square @;            // 25
```

`:name` pops the top of the stack and registers it as a named operator. Blocks become callable operators; plain values (numbers, strings) are pushed onto the stack when the operator is used.

```jth
3.14159 :PI;
PI @;   // 3.14159 — PI pushes the value onto the stack
```

`::name` pops a value into a JavaScript `const`. This is primarily used for interop with inline JS — it is *not* accessible as a jth operator name.

### Control Flow

**if** — pops a condition, a true-block, and a false-block:

```jth
// Syntax: #[ false-block ] #[ true-block ] condition if

#[ "odd" ] #[ "even" ] 10 2 % 0 = if @;
// 10 % 2 = 0, 0 = 0 is true, so "even" is printed
```

The order on the stack before `if` executes is: false-block (bottom), true-block, condition (top). In code you write the false-block first, then the true-block, then the condition.

**if/elseif/else chains** — flat conditional chaining without nesting:

```jth
dupe 15 % 0 = #[ drop "FizzBuzz" ] swap if
dupe 3 % 0 = #[ drop "Fizz" ] swap elseif
dupe 5 % 0 = #[ drop "Buzz" ] swap elseif
#[ ] else
```

`if` in 2-arg mode starts a chain. `elseif` checks additional conditions. `else` is the fallback. Only the first matching branch executes.

**times** — runs a block N times:

```jth
#[ "hi" @ ] 3 times;
// logs "hi" three times
```

**when** — keeps a value only if the condition is truthy:

```jth
42 true when;    // stack: [42]
42 false when;   // stack: []
```

### Error Handling

**try** wraps a block and catches any error:

```jth
#[ "oops" throw ] try;   // stack: [Error("oops")]
error? @;                 // true
```

**throw** pops a message and throws an error. **error?** checks whether the top of the stack is an Error.

### Arrays

Arrays use square brackets with space-separated values:

```jth
[1 2 3] @;         // [1, 2, 3]
[1 2 3] 4 push @;  // [1, 2, 3, 4]
[1 2 3] ...;       // spreads onto stack: 1, 2, 3
```

Array operators include `push`, `pop`, `shift`, `unshift`, `flatten`, `suppose` (add to collection), `...` (spread), and `collect` (gather stack into array).

### Strings

```jth
"hello" upper @;              // "HELLO"
"hello" "world" strcat @;     // "helloworld"
"hello world" len @;          // 11
"  hello  " trim @;           // "hello"
```

### Objects

Objects use `{ }` with alternating key-value pairs:

```jth
{ "name" "jth" "version" 2 } @;
// { name: "jth", version: 2 }

{ "a" 1 "b" 2 } keys @;      // ["a", "b"]
{ "a" 1 "b" 2 } values @;    // [1, 2]
```

### Comments

`//` starts a comment and also acts as a statement terminator:

```jth
42 @  // this logs 42
7 @   // and this logs 7
```

### Imports and Exports

Import operators from another jth file:

```jth
::import "./math.jth" { square cube };
5 square @;   // 25
```

Export operators from a module:

```jth
#[ dupe * ] :square;
#[ dupe dupe * * ] :cube;
::export square cube;
```

### Dynamic Operators

Prefix a number to an operator to create a partial application. The semantics are `N op x` — the prefix number comes first:

```jth
10 3+;      // 3 + 10 = 13  (commutative, same either way)
7 2*;       // 2 * 7 = 14   (commutative)
100 10log;  // log base 10 of 100 = 2
8 2log;     // log base 2 of 8 = 3
```

For non-commutative operators, the prefix number is the left operand: `3-` means `3 - x`, `2/` means `2 / x`.

### Inline JavaScript

Double parentheses embed raw JavaScript. The expression is treated as a value:

```jth
((Math.random())) @;           // random number
((x => x * 2)) :double;
5 double @;                    // 10
```

### Async

`_` awaits a promise. `__` runs Promise.all on an array of promises:

```jth
((fetch("https://api.example.com/data"))) _ @;
```

---

## Operator Reference

### Arithmetic

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `2 3 +` => `5` |
| `-` | Subtraction | `10 3 -` => `7` |
| `*` | Multiplication | `4 5 *` => `20` |
| `/` | Division | `15 4 /` => `3.75` |
| `%` | Modulo | `17 5 %` => `2` |
| `%%` | Remainder | `17 5 %%` => `2` |
| `**` | Exponentiation | `2 8 **` => `256` |
| `++` | Increment | `5 ++` => `6` |
| `--` | Decrement | `5 --` => `4` |
| `abs` | Absolute value | `-5 abs` => `5` |
| `sqrt` / `√` | Square root | `16 sqrt` => `4` |
| `floor` | Floor | `3.7 floor` => `3` |
| `ceil` | Ceiling | `3.2 ceil` => `4` |
| `round` | Round | `3.5 round` => `4` |
| `trunc` | Truncate | `3.9 trunc` => `3` |
| `log` | Natural logarithm | `1 log` => `0` |
| `⋅` | Multiply (unicode) | `4 5 ⋅` => `20` |
| `÷` | Divide (unicode) | `15 3 ÷` => `5` |

### Variadic Math

| Operator | Description | Example |
|----------|-------------|---------|
| `Σ` | Sum all stack values (variadic) | `1 2 3 Σ` => `6` |
| `Π` | Product of all stack values (variadic) | `2 3 4 Π` => `24` |
| `min` | Minimum of all stack values (variadic) | `3 7 1 min` => `1` |
| `max` | Maximum of all stack values (variadic) | `3 7 1 max` => `7` |

### Stack Manipulation

| Operator | Description | Example |
|----------|-------------|---------|
| `noop` / `∅` | Do nothing | `5 noop` => stack unchanged |
| `clear` | Clear the stack | `1 2 3 clear` => `[]` |
| `...` | Spread (array to stack) | `[1 2 3] ...` => `1 2 3` on stack |
| `drop` | Remove top | `1 2 drop` => `[1]` |
| `dupe` | Duplicate top | `5 dupe` => `[5, 5]` |
| `copy` | Duplicate entire stack | `1 2 copy` => `[1, 2, 1, 2]` |
| `swap` | Swap top two | `1 2 swap` => `[2, 1]` |
| `reverse` | Reverse stack | `1 2 3 reverse` => `[3, 2, 1]` |
| `count` | Push stack depth | `1 2 count` => `[1, 2, 2]` |
| `collect` | All items to array | `1 2 3 collect` => `[[1, 2, 3]]` |
| `@` | Peek/log top | `42 @` => logs `42` |
| `@@` | View/log all | `1 2 @@` => logs `1 2` |

### Comparison

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Strict equal | `3 3 =` => `true` |
| `==` | Loose equal | `3 "3" ==` => `true` |
| `<` | Less than | `2 5 <` => `true` |
| `<=` | Less than or equal | `3 3 <=` => `true` |
| `>` | Greater than | `5 2 >` => `true` |
| `>=` | Greater than or equal | `3 3 >=` => `true` |
| `<=>` | Spaceship (three-way) | `3 5 <=>` => `-1` |

### Logic

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `true false &&` => `false` |
| `\|\|` | Logical OR | `true false \|\|` => `true` |
| `xor` | Exclusive OR | `true false xor` => `true` |
| `nand` | NOT AND | `true true nand` => `false` |
| `nor` | NOT OR | `false false nor` => `true` |
| `~~` / `not` | Logical NOT | `true ~~` => `false` |

### Control Flow

| Operator | Description | Example |
|----------|-------------|---------|
| `if` | Conditional branch (3-arg) | `#[ "no" ] #[ "yes" ] true if` => `"yes"` |
| `if` | Start conditional chain (2-arg) | `#[ "yes" ] true if` |
| `elseif` | Chain conditional | `#[ "alt" ] cond elseif` |
| `else` | Default branch | `#[ "default" ] else` |
| `when` | Keep if truthy | `42 true when` => `42` |
| `drop-when` | Drop if truthy | `42 true drop-when` => `[]` |
| `keep-if` | Keep value if truthy | `42 true keep-if` => `42` |
| `drop-if` | Drop value if truthy | `42 true drop-if` => `[]` |
| `times` | Repeat block N times | `#[ "hi" @ ] 3 times` |

### Error Handling

| Operator | Description | Example |
|----------|-------------|---------|
| `try` | Catch errors from block | `#[ "fail" throw ] try` => `Error` |
| `throw` | Throw an error | `"oops" throw` |
| `error?` | Check if top is Error | `err error?` => `true` |

### Strings

| Operator | Description | Example |
|----------|-------------|---------|
| `len` | Length | `"hello" len` => `5` |
| `upper` | Uppercase | `"hi" upper` => `"HI"` |
| `lower` | Lowercase | `"HI" lower` => `"hi"` |
| `trim` | Trim whitespace | `" hi " trim` => `"hi"` |
| `strcat` | Concatenate | `"ab" "cd" strcat` => `"abcd"` |
| `strseq` | Reverse concat | `"ab" "cd" strseq` => `"cdab"` |

### Type Checking

| Operator | Description | Example |
|----------|-------------|---------|
| `typeof` | Push type string | `42 typeof` => `"number"` |
| `number?` | Is number? | `42 number?` => `true` |
| `string?` | Is string? | `"hi" string?` => `true` |
| `array?` | Is array? | `[1] array?` => `true` |
| `nil?` | Is null/undefined? | `null nil?` => `true` |
| `function?` | Is function? | `#[ ] function?` => `true` |
| `empty?` | Is empty? | `"" empty?` => `true` |
| `contains?` | Contains element? | `[1 2 3] 2 contains?` => `true` |

### Arrays

| Operator | Description | Example |
|----------|-------------|---------|
| `push` | Append to array | `[1 2] 3 push` => `[1,2,3]` |
| `pop` | Remove last (pushes array and item) | `[1 2 3] pop` => `[1,2]` and `3` |
| `shift` | Remove first (pushes array and item) | `[1 2 3] shift` => `[2,3]` and `1` |
| `unshift` | Prepend to array | `[2 3] 1 unshift` => `[1,2,3]` |
| `suppose` | Add to collection | `[1 2] 3 suppose` => `[1,2,3]` |
| `flatten` | Flatten all stack values (variadic) | `[1] [2 3] flatten` => `1 2 3` on stack |
| `map` | Apply block to each element | `[1 2 3] #[ 2 * ] map` => `[2,4,6]` |
| `filter` | Keep elements where block is truthy | `[1 2 3 4] #[ 2 % 0 = ] filter` => `[2,4]` |
| `reduce` | Accumulate with block and init | `[1 2 3] 0 #[ + ] reduce` => `6` |
| `fold` | Alias for reduce (catamorphism) | `[1 2 3] 0 #[ + ] fold` => `6` |
| `bend` | Unfold/anamorphism from seed | `1 #[ 5 <= ] #[ dupe 1 + ] bend` => `[1,2,3,4,5]` |

### Objects / Dictionaries

| Operator | Description | Example |
|----------|-------------|---------|
| `keys` | Get keys | `{ "a" 1 } keys` => `["a"]` |
| `values` | Get values | `{ "a" 1 } values` => `[1]` |
| `entries` | Get entries | `{ "a" 1 } entries` => `[["a",1]]` |
| `merge` | Merge objects | `obj1 obj2 merge` |
| `record` | Build from pairs | `[["a" 1]] record` => `{a: 1}` |

### Serialization

| Operator | Description | Example |
|----------|-------------|---------|
| `into-json` | Stringify to JSON | `{ "a" 1 } into-json` => `'{"a":1}'` |
| `to-json` | Parse JSON string | `'{"a":1}' to-json` => `{a: 1}` |
| `into-lines` | Join by newline | `["a" "b"] into-lines` => `"a\nb"` |
| `to-lines` | Split by newline | `"a\nb" to-lines` => `["a","b"]` |

### Async

| Operator | Description | Example |
|----------|-------------|---------|
| `_` | Await a promise | `promise _` |
| `__` | Promise.all | `[p1 p2] __` |

### Meta / Execution

| Operator | Description | Example |
|----------|-------------|---------|
| `$` | Execute block | `#[ 2 3 + ] $` => `5` |
| `$$` | Execute and spread | `#[ 2 3 + ] $$` |
| `<<-` | Rewind all | Moves pointer to start |
| `->>` | Skip all | Moves pointer to end |

### Iterators

| Operator | Description | Example |
|----------|-------------|---------|
| `iter` | Create iterator | `[1 2 3] iter` |
| `next` | Get next value | `iterator next` |
| `..` | Exhaust to array | `iterator ..` |

### Sequences

| Operator | Description | Example |
|----------|-------------|---------|
| `fibonacci` | Fibonacci step | `0 1 fibonacci` => `1 0 1` (pushes b, a, a+b) |

### Statistics

All statistics operators are variadic — they consume the entire stack.

| Operator | Description | Example |
|----------|-------------|---------|
| `mean` / `x̄` | Arithmetic mean | `1 2 3 mean` => `2` |
| `median` | Median value | `1 2 3 median` => `2` |
| `mode` | Most frequent | `1 1 2 mode` => `1` |
| `modes` | All modes | `1 1 2 2 modes` => `[1, 2]` |

### Hyperoperations

| Operator | Description | Example |
|----------|-------------|---------|
| `***` | Tetration | `2 3 ***` |
| `****` | Pentation | `2 3 ****` |

### Dynamic Operators

Prefix any number to an arithmetic operator. Semantics: `N op x` (N is left operand):

| Pattern | Description | Example |
|---------|-------------|---------|
| `N+` | N + x | `10 3+` => `13` |
| `N-` | N - x | `20 3-` => `-17` (3 - 20) |
| `N*` | N * x | `7 2*` => `14` |
| `N/` | N / x | `50 100/` => `2` (100 / 50) |
| `N%` | N % x | `17 5%` => `5` |
| `N**` | N ** x | `3 2**` => `8` (2 ** 3) |
| `Nlog` | Log base N of x | `100 10log` => `2` |

---

## CLI Reference

```
jth run <file>              # Compile and execute a .jth file
jth run -c '<code>'         # Run inline jth code
jth compile <file> [output] # Compile .jth to .mjs
jth compile -c '<code>'     # Compile inline code to stdout
jth --version, -v           # Show version
jth --help, -h              # Show help
```

---

## Project Structure

jth is organized as a monorepo with 7 packages:

| Package | Description |
|---------|-------------|
| **jth-runtime** | Stack VM, `processN`, `op()` helper, operator registry |
| **jth-compiler** | Lexer, parser, code generator, transform pipeline |
| **jth-stdlib** | Standard library (~110 operators) |
| **jth-cli** | Command-line interface for running and compiling |
| **jth-repl** | Interactive REPL |
| **jth-ai** | Ollama AI integration |
| **jth-types** | Internal type definitions |

---

## Development

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```
