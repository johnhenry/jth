# jth Roadmap

## 0.3.0 (current)

### Syntax swap: blocks and objects
- [x] `#[ ]` for blocks, `{ }` for objects
- [x] Import bindings keep `{ }` to mirror JS destructuring
- [x] Updated all examples, tests, and documentation

### `elseif` / `else` chaining
- [x] Add `elseif` operator for chained conditionals
- [x] Add `else` as sugar for the false-branch of `if`
- [x] Current pattern requires deeply nested blocks:
  ```jth
  #[ ... ] swap #[ ... ] swap if
  ```
  Goal: support a flatter syntax like:
  ```jth
  #[ "fizzbuzz" ] 15 % 0 = if
  #[ "fizz" ] 3 % 0 = elseif
  #[ "buzz" ] 5 % 0 = elseif
  #[ n ] else
  ```

### `map` / `filter` / `reduce` as first-class operators
- [x] `map` — apply a block to each element of an array, return new array
- [x] `filter` — keep elements where block returns truthy
- [x] `reduce` / `fold` — accumulate over an array with a block and initial value
- [x] Ensure consistent semantics: block receives element on a fresh stack, result is collected

### Folds and bends
- [x] Investigate fold/bend patterns inspired by [HVM/Bend](https://github.com/HigherOrderCO/bend/blob/main/GUIDE.md#folds-and-bends)
- [x] `fold` — structural recursion over data (catamorphism) — alias for `reduce`
- [x] `bend` — structural corecursion / unfold (anamorphism)
- [x] Determine how these map to jth's stack model:
  - Fold: consume a structure element-by-element, accumulating on the stack
  - Bend: produce a structure by repeatedly applying a block until a condition is met
- [x] Consider whether folds/bends replace or complement `times` and `reduce`

## Future

### Performance
- Evaluate alternative stack representations (linked list vs array)
- Benchmark common patterns and optimize hot paths

### Module system
- Support for package-level imports (npm/jsr packages)
- Namespace operator resolution

### Tooling
- Language server / editor support
- Source maps for compiled output
- REPL improvements (tab completion, history)

### Language features
- Pattern matching on stack values
- Typed operator signatures
- Tail-call optimization for recursive blocks
