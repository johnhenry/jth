# Changelog

⚠️WARNING⚠️ Breaking Changes

## 0.2.0 - Internal Affairs

### Core Language Changes
- Paradigm shift -- eager execution of functions by default
  - `!` is no longer used to execute functions
  - Functions now must be intentionally delayed using special higher-order functions
- AST transformation removed (temporarily?)
- Working REPL with improved stability
- Operators support
  - Built-in operators (+, -, *, /, etc.)
  - Define operators at runtime
  - New bitwise operators

### New Functions and Features

#### Math Functions
- `gcd` - Greatest common divisor
- `lcm` - Least common multiple  
- `abs` - Absolute value
- Enhanced math operators with JSDoc documentation

#### Data Structures
- **Dictionary operations:**
  - `get` - Get value(s) from a dictionary
  - `set` - Set value(s) in a dictionary
- **Iterator operations:**
  - `iter` - Create an iterator from an iterable
  - `next` - Get next value from an iterator
  - `drain` - Drain n values from an iterator to the stack
- **Range operations:**
  - `to` - Create exclusive range
  - `fromTo` - Create range inclusive of start
  - `toInc` - Create range inclusive of end
  - `fromToInc` - Create fully inclusive range

#### Statistics Functions
- `mean` - Calculate mean
- `median` - Calculate median
- `mode` - Calculate mode
- `modes` - Calculate all modes
- `populationVariance` - Population variance
- `sampleVariance` - Sample variance
- `populationStandardDeviation` - Population standard deviation
- `sampleStandardDeviation` - Sample standard deviation
- `percentile` - Calculate percentile
- `fiveNumberSummary` - Five number summary
- `fiveNumberSummaryB` - Alternative five number summary

#### Data Type Support
- JSON parsing and stringification
- Map creation and manipulation
- Set creation and manipulation
- Environment variable reading

#### Execution Control
- `executeWait` - Execute function and wait for resolution
- `executeWaitSpread` - Execute, wait, and spread results

#### Other Additions
- `fibonacci` - Generate next Fibonacci number
- `exhaustIterator` - Exhaust an iterator to array

### Documentation & Examples
- Comprehensive JSDoc comments added throughout codebase
- New example files demonstrating:
  - Dictionary operations (dict.jth)
  - Iterator operations (iterator.jth)
  - Range operations (range.jth)
  - Statistics functions (statistics.jth)
  - Miscellaneous functions (misc.jth)
- Updated "Big List of Built-in Functions" documentation
- Improved README with clearer installation and usage instructions

### Architecture Changes
- Batteries included approach
  - More functions included by default
  - At some point these should be sorted into dedicated libraries
- jth-tools and jth-stats temporarily paused
  - All related functions are included in `jth-core/core`
    until better separation strategy is determined

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
