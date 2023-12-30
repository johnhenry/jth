# Changelog

⚠️WARNING⚠️ Breaking Changes

## 0.2.0 - Internal Affairs

- Paradigm shift -- eagar execution of functions by default
  - `!` is no longer used to execute functions
  - Functions now must be intentionally delayed using [special higher-order functions]()
- AST trasnfromation removed (temporarily?)
- Working REPL
- Batteries included
  - More functions included by default.
  - At some point I should sort these out into dedicated libraries,
    but as of now it's unclear how these should _best_ be separated.
- jth-tools and jth-stats temporarily paused
  - All related functions are included in `jth-core/core`
    until I can better understand how they should be seperated.
- Operators support
  - Built in operators (+, -, etc...)
  - Define operators at runtime

## 0.1.0 - Here comes the AST!

⚠️WARNING⚠️ Breaking Changes

### Notable changes:

- Use of a rudamentary abstract syntax tree
  - This will allow for for better syntax checks and possibly better tooling in the future.
  - removal of `transformIterator` export from core
  - additon of `ast` export to core that produces an AST from jth code.
- Update to function composition syntax:
  - The composition operator `:` has been removed in favor of using `!`
    as an infix operator
    - ❌ This is no longer valid:
      `func0$ func1$ func2$ :! -> [composedFunc$];`
    - ✅ Instead, use:
      `func0$!func1!$func2$ ->[composedFunc$];`.
- New behavior for sub-programs/arrays:

  - In the previous version, the `[` `]` operators would
    create and run a _sub-program_,
    then expand the results into the current stack.

    - ❌ This is no loger valid: `5 [2 2 product$!!] 3 -> [five, four, three];`

  - Also, previously, ending instead with `].` would create an array what could later be expanded.

    - ❌ This is no loger valid: `5 [2 2 product$!!]. 3 -> [five, arrayWithFour, three];`

  - Currently, `[` and `]` create a sub-program in a "paused" state.
    It can later be executed or expanded.
    - `5 [2 2 product$!!] 3 -> [five, pausedSubProgram, three];`
  - Approximate previous behavior by executing and expanding with `]!.`
    - `5 [2 2 product$!!]!. 3 -> [five, four, three];`
  - Execute without code without expansion by ending with `]!`.
    - `5 [2 2 product$!!]! 3 -> [five, arrayWithFour, three];`
  - Expand without execution using by ending with `].`
    - `5 [2 2 product$]. !! 3 -> [twenty, three];`

### Known Issues

- The `repl` command in the CLI is currently borked

## 0.0.0 - 1st 2nd 3rd 4th 5th 6th 7th jht! (initial release)

- Initial release
- Core transformation under '/packages/core/`
- CLI code under '/packages/cli/`
  - depends on core transformation
- Standard library of tools under '/packages/tools/`
- Library for statistics under '/packages/stats/`
