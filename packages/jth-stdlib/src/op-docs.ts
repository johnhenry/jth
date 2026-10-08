import type { OpArity, DynamicOpInfo } from "@johnhenry/jth-types";

/**
 * The single source of per-operator documentation for jth-stdlib.
 *
 * Keyed by the exact registered name (aliases get their own entry).
 * `registerAll()` hands each entry to `registry.set(name, fn, doc)`, and from
 * there it feeds `getMeta(fn).description`, `registry.info()/infos()`, the CLI
 * `jth help <op>`, and the generated docs/operators.md.
 *
 * Entry: `[description]` or `[description, arity]`. Leave the arity out when
 * the operator declares one via `op(n)` / `variadic()`; give it explicitly
 * for raw stack operators (otherwise it is reported as "varies").
 */
type Doc = [description: string] | [description: string, arity: OpArity];

export const OP_DOCS: Record<string, Doc> = {
  // Stack manipulation
  "noop": ["Do nothing."],
  "∅": ["Do nothing (alias of noop)."],
  "clear": ["Remove every item from the stack.", "variadic"],
  "...": ["Spread an array onto the stack as individual items."],
  "spread": ["Spread an array onto the stack as individual items (alias of ...)."],
  "drop": ["Remove the top item."],
  "keepN": ["Keep only the bottom N items, dropping the rest. Written keepN(N); N is taken from the stack.", 1],
  "retrieve": ["Replace the stack with the single item I positions below the top (0 = top). Written retrieve(I).", 1],
  "dig": ["Pull the Nth item from the top up to the top. Written dig(N).", 1],
  "bury": ["Move the top item N positions down. Written bury(N).", 1],
  "dupe": ["Duplicate the top item.", 1],
  "dup": ["Duplicate the top item (alias of dupe).", 1],
  "copy": ["Duplicate the entire stack.", "variadic"],
  "swap": ["Swap the top two items.", 2],
  "reverse": ["Reverse the whole stack.", "variadic"],
  "count": ["Push the current stack depth.", 0],
  "depth": ["Push the current stack depth (alias of count).", 0],
  "collect": ["Collect every stack item into a single array."],
  "peek": ["Print the top item to the console without consuming it.", 1],
  "peek-all": ["Print every stack item to the console without consuming them.", "variadic"],
  "apply": ["Pop a block and execute it against the stack."],
  "exec": ["Pop a block and execute it against the stack (alias of apply)."],
  "over": ["Copy the second item to the top."],
  "rot": ["Rotate the third item to the top."],

  // Arithmetic
  "+": ["Add two numbers."],
  "-": ["Subtract the top number from the one below it."],
  "*": ["Multiply two numbers."],
  "⋅": ["Multiply two numbers (alias of *)."],
  "/": ["Divide the lower number by the top number."],
  "÷": ["Divide the lower number by the top number (alias of /)."],
  "**": ["Raise the lower number to the power of the top number."],
  "%": ["Modulo (result takes the sign of the divisor)."],
  "%%": ["Remainder (result takes the sign of the dividend)."],
  "++": ["Increment by one."],
  "--": ["Decrement by one."],
  "Σ": ["Sum every stack item."],
  "Π": ["Multiply every stack item together."],
  "abs": ["Absolute value."],
  "|\u{1D465}|": ["Absolute value (alias of abs)."],
  "√": ["Square root (alias of sqrt)."],
  "sqrt": ["Square root."],
  "floor": ["Round down to an integer."],
  "ceil": ["Round up to an integer."],
  "round": ["Round to the nearest integer."],
  "trunc": ["Drop the fractional part."],
  "log": ["Natural logarithm."],
  "min": ["Smallest of every stack item."],
  "max": ["Largest of every stack item."],
  "plus": ["Add two numbers (alias of +)."],
  "minus": ["Subtract the top number from the one below it (alias of -)."],
  "mul": ["Multiply two numbers (alias of *)."],
  "div": ["Divide the lower number by the top number (alias of /)."],
  "mod": ["Modulo (alias of %)."],
  "pow": ["Exponentiation (alias of **)."],

  // Comparison
  "=": ["Strict equality."],
  "==": ["Loose equality."],
  "<": ["True if the lower item is less than the top item."],
  "<=": ["True if the lower item is less than or equal to the top item."],
  ">": ["True if the lower item is greater than the top item."],
  ">=": ["True if the lower item is greater than or equal to the top item."],
  "<=>": ["Three-way comparison: -1, 0 or 1."],
  "eq?": ["Strict equality (alias of =)."],
  "ne?": ["Not equal (alias of !=)."],
  "!=": ["Not equal."],
  "lt?": ["Less than (alias of <)."],
  "le?": ["Less than or equal (alias of <=)."],
  "gt?": ["Greater than (alias of >)."],
  "ge?": ["Greater than or equal (alias of >=)."],

  // Logic
  "&&": ["Logical AND."],
  "||": ["Logical OR."],
  "xor": ["Exclusive OR."],
  "nand": ["Logical NOT AND."],
  "nor": ["Logical NOT OR."],
  "~~": ["Logical NOT."],
  "not": ["Logical NOT (alias of ~~)."],

  // Control flow
  "if": ["Conditional: run a block when the condition is truthy (optionally with an else block).", "varies"],
  "elseif": ["Chain another conditional onto a preceding if.", "varies"],
  "else": ["Default branch of a conditional chain.", "varies"],
  "when": ["Pop a condition; keep the value below it only if the condition is truthy.", 2],
  "drop-when": ["Pop a condition; drop the value below it if the condition is truthy.", 2],
  "keep-if": ["Keep the value if the condition is truthy."],
  "drop-if": ["Drop the value if the condition is truthy."],
  "times": ["Run a block N times.", "varies"],
  "while": ["Run a body block while a condition block yields truthy.", "varies"],
  "until": ["Run a body block until a condition block yields truthy.", "varies"],
  "break": ["Exit the current loop.", 0],

  // Error handling
  "try": ["Run a block; on error push the Error instead of propagating.", "varies"],
  "throw": ["Throw the top item as an error."],
  "error?": ["True if the top item is an Error."],

  // Strings
  "len": ["Length of a string or array."],
  "upper": ["Uppercase a string."],
  "lower": ["Lowercase a string."],
  "trim": ["Trim surrounding whitespace."],
  "strcat": ["Concatenate two strings."],
  "strseq": ["Concatenate two strings in reverse order."],
  "startsWith": ["True if the string starts with the given prefix."],
  "endsWith": ["True if the string ends with the given suffix."],
  "indexOf": ["Index of a substring (or -1)."],
  "starts?": ["True if the string starts with the given prefix (alias of startsWith)."],
  "ends?": ["True if the string ends with the given suffix (alias of endsWith)."],
  "index-of": ["Index of a substring (alias of indexOf)."],

  // Type checking
  "typeof": ["Push the type name of the top item."],
  "number?": ["True if the top item is a number."],
  "string?": ["True if the top item is a string."],
  "array?": ["True if the top item is an array."],
  "nil?": ["True if the top item is null or undefined."],
  "function?": ["True if the top item is a function or block."],
  "empty?": ["True if the string or array is empty."],
  "contains?": ["True if the array or string contains the element."],

  // Serialization
  "into-json": ["Stringify a value to JSON."],
  "from-json": ["Parse a JSON string."],
  "into-lines": ["Join an array of strings with newlines."],
  "from-lines": ["Split a string on newlines into an array."],
  "to-json": ["Parse a JSON string (legacy alias of from-json)."],
  "to-lines": ["Split a string on newlines (legacy alias of from-lines)."],

  // Arrays
  "push": ["Append an item to an array."],
  "pop": ["Remove the last element of an array; push the array and the element."],
  "shift": ["Remove the first element of an array; push the array and the element."],
  "unshift": ["Prepend an item to an array."],
  "suppose": ["Add an item to an array or Set."],
  "flatten": ["Flatten nested arrays among all stack items into a flat sequence of items."],
  "map": ["Apply a block to each element of an array, collecting the results.", "varies"],
  "filter": ["Keep the elements of an array for which a block yields truthy.", "varies"],
  "reduce": ["Fold an array with a block and an initial value.", "varies"],
  "fold": ["Fold an array with a block and an initial value (alias of reduce).", "varies"],
  "bend": ["Unfold an array from a seed, a predicate block and a step block.", "varies"],

  // Objects
  "keys": ["Keys of an object."],
  "values": ["Values of an object."],
  "entries": ["[key, value] pairs of an object."],
  "merge": ["Merge two objects."],
  "record": ["Build an object from stack items taken as value/key pairs."],

  // Combinators
  "each": ["Apply a block to each stack item.", "varies"],
  "fanout": ["Run a value through several blocks, pushing every result.", "varies"],
  "zip": ["Pair up the elements of two arrays."],
  "compose": ["Combine two blocks into one pipeline block."],

  // Async
  "_": ["Await the promise on top of the stack and push its resolved value.", 1],
  "__": ["Await every promise on the stack (Promise.all).", "variadic"],

  // Meta / execution
  "$": ["Execute a block (legacy alias of apply).", "varies"],
  "$$": ["Execute a block and spread its result.", "varies"],
  "<<-": ["Rewind: move every stack item back into the processing queue.", "varies"],
  "->>": ["Skip: push every remaining queue item as a value instead of running it.", "varies"],

  // Iterators / sequences
  "next": ["Advance an iterator and push its next value."],
  "iter": ["Create an iterator from an iterable."],
  "..": ["Exhaust an iterator into an array."],
  "fibonacci": ["Fibonacci step: given a b, push b a a+b."],

  // Statistics
  "x̄": ["Arithmetic mean of the stack (alias of mean)."],
  "mean": ["Arithmetic mean of every stack item."],
  "median": ["Median of every stack item."],
  "mode": ["Most frequent stack item."],
  "modes": ["Array of all most-frequent stack items."],
};

/** Documentation for jth-stdlib's dynamically matched operator families. */
export const DYNAMIC_OP_DOCS: Record<string, DynamicOpInfo> = {
  arithmetic: {
    syntax: "N+  N-  N*  N/  N%  N**",
    arity: 1,
    description: "Number-prefixed arithmetic: `N op x` applies the operator with N as the left operand (3+ adds 3). Suffix n for BigInt (3n+).",
  },
  log: {
    syntax: "Nlog",
    arity: 1,
    description: "Logarithm of x in base N (10log).",
  },
  hyperop: {
    syntax: "***  ****  ...",
    arity: 2,
    description: "Hyperoperations: *** is tetration, **** pentation, and so on.",
  },
};
