# Changelog

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
