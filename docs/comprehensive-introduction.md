# Comprehensive Introduction to jth

## What is jth?

jth (pronounced "jith") is a stack-oriented, concatenative programming language that compiles to JavaScript. It combines the power of stack-based programming with JavaScript interoperability, offering a unique approach to functional programming with eager evaluation by default.

## Core Concepts

### The Stack

Everything in jth operates on a stack. Values are pushed onto the stack and functions consume values from the stack, replacing them with results.

```jth
1 2 3;  // Stack: [1, 2, 3]
```

### Concatenative Programming

Programs are built by concatenating operations. The output of one operation becomes the input of the next.

```jth
2 3 + 5 *;  // 2 and 3 are added (5), then multiplied by 5 (25)
```

## Basic Syntax

### Line Termination

All lines must end with a semicolon (`;`), even comments:

```jth
"Hello" "World" strcat;  // Concatenates strings;
// This is a comment;
```

### Values and Literals

```jth
// Numbers
42 3.14 -17 1e6;

// Strings
"Hello" 'World' `Template`;

// Booleans
true false;

// JavaScript values (wrapped in parentheses)
(Math.PI) (Date.now()) (null) (undefined);
```

## Stack Operations

### Basic Stack Manipulation

```jth
// drop - removes the last item
1 2 3 drop;  // Stack: [1, 2]

// dupe - duplicates the last item
1 2 dupe;  // Stack: [1, 2, 2]

// swap - swaps the last two items
1 2 swap;  // Stack: [2, 1]

// clear - clears the entire stack
1 2 3 clear;  // Stack: []

// reverse - reverses the entire stack
1 2 3 reverse;  // Stack: [3, 2, 1]

// count - pushes the count of items
1 2 3 count;  // Stack: [1, 2, 3, 3]
```

### Advanced Stack Operations

```jth
// cycle - rotates stack forward
1 2 3 cycle;  // Stack: [3, 1, 2]

// recycle - rotates stack backward
1 2 3 recycle;  // Stack: [2, 3, 1]

// retrieve - gets item at index
1 2 3 4 1 retrieve;  // Stack: [1, 2, 3, 4, 3]

// keepN - keeps only N items
1 2 3 4 5 2 keepN;  // Stack: [4, 5]

// dropN - drops N items
1 2 3 4 5 2 dropN;  // Stack: [1, 2, 3]
```

## Operators

### Arithmetic Operators

```jth
// Basic arithmetic
2 3 +;   // 5 (addition)
5 2 -;   // 3 (subtraction)
3 4 *;   // 12 (multiplication)
10 2 /;  // 5 (division)
2 3 **;  // 8 (exponentiation)
10 3 %;  // 1 (modulo)

// Aliases
2 3 plus;     // 5
5 2 minus;    // 3
3 4 times;    // 12
10 2 divide;  // 5
2 3 exp;      // 8
10 3 mod;     // 1

// Aggregate operations
1 2 3 4 sum;      // 10 (sum all)
1 2 3 4 product;  // 24 (multiply all)
```

### Comparison Operators

```jth
// Equality
3 3 ==;   // true (equal)
3 "3" ~=; // true (coerced equal)
3 4 !=;   // true (not equal)

// Comparison
3 5 <;    // true (less than)
5 5 <=;   // true (less than or equal)
7 5 >;    // true (greater than)
5 5 >=;   // true (greater than or equal)

// Spaceship operator (returns -1, 0, or 1)
3 5 <=>;  // -1
5 5 <=>;  // 0
7 5 <=>;  // 1
```

### Logical Operators

```jth
// Basic logic
true false &&;   // false (and)
true false ||;   // true (or)
true !;          // false (not)

// Extended logic
true false xor;   // true (exclusive or)
true false nand;  // true (not and)
true false nor;   // false (not or)

// Aggregate logic
true true false andAll;  // false
true true false orAll;   // true
true true true xorAll;   // true
```

### Bitwise Operators

```jth
5 3 &;   // 1 (bitwise AND)
5 3 |;   // 7 (bitwise OR)
5 3 ^;   // 6 (bitwise XOR)
5 ~;     // -6 (bitwise NOT)
5 2 <<;  // 20 (left shift)
20 2 >>; // 5 (right shift)
-5 2 >>>; // 1073741822 (unsigned right shift)
```

## Variables and Assignment

### Basic Assignment

```jth
// Assign entire stack to variable
1 2 3 ::: myStack;
myStack;  // Puts [1, 2, 3] on stack

// Destructuring assignment
1 2 3 4 5 ::: [a b c ...rest];
a;     // 1
rest;  // [4, 5]
```

### Spread Operator

```jth
// Collect into array
1 2 3 ::: [...arr];
arr;  // [1, 2, 3]

// Spread array onto stack
[1 2 3] ...;  // Stack: [1, 2, 3]
```

## Arrays and Sub-programs

### Array Creation

```jth
// Basic array
[1 2 3];  // Creates array [1, 2, 3]

// Functions in arrays are paused
[1 2 +];  // Creates [1, 2, +] not [3]

// Execute paused functions
[1 2 +] ... <-;  // Spreads then steps back: 3

// Execute array immediately
[1 2 +] !;     // Returns Promise
[1 2 +] ! _;   // Wait for Promise: [3]
[1 2 +] ! _ ...; // Wait and spread: 3
```

### Array Operations

```jth
// push - add to end
[1 2] 3 push;  // [1, 2, 3]

// pop - remove from end
[1 2 3] pop;  // [1, 2] 3

// shift - remove from start
[1 2 3] shift;  // [2, 3] 1

// unshift - add to start
[2 3] 1 unshift;  // [1, 2, 3]

// flatten - flatten nested arrays
[[1 2] [3 4]] flatten;  // [1, 2, 3, 4]
```

## Functions

### Built-in Functions

```jth
// Math functions
4 sqrt;       // 2
3.7 floor;    // 3
3.2 ceil;     // 4
3.7 round;    // 4
10 log;       // 2.302...
100 log10;    // 2
8 log2;       // 3
-5 abs;       // 5
1 2 3 4 min;  // 1
1 2 3 4 max;  // 4

// Trigonometric
0 sin;        // 0
0 cos;        // 1
0 tan;        // 0

// Number theory
12 8 gcd;     // 4 (greatest common divisor)
12 8 lcm;     // 24 (least common multiple)
12 8 4 gcdAll; // 4
12 8 4 lcmAll; // 24
```

### String Operations

```jth
// Concatenation
"Hello" " " "World" strcat;  // "Hello World"
"a" "b" "c" strseq;          // "abc"

// Case conversion
"Hello" toLowerCase;  // "hello"
"Hello" toUpperCase;  // "HELLO"

// Trimming
"  hello  " trim;       // "hello"
"  hello  " trimStart;  // "hello  "
"  hello  " trimEnd;    // "  hello"

// Testing
"hello" "he" startsWith;  // true
"hello" "lo" endsWith;    // true

// Splitting
"a,b,c" "," split;  // ["a", "b", "c"]

// Substring
"hello" 1 4 substring;  // "ell"
```

### Function Composition

```jth
// Using ! as infix operator
inc dupe !;  // Compose increment and duplicate

// Store composed function
inc dupe ! ::: incAndDupe;
5 incAndDupe;  // Stack: [6, 6]
```

## Higher-Order Functions

### Map, Filter, Reduce

```jth
// map - apply function to all items
1 2 3 inc map;  // [2, 3, 4]

// filter - keep items that pass test
1 2 3 4 5 (x => x > 2) filter;  // [3, 4, 5]

// Custom higher-order operations
1 2 3 4 (x => x * 2) map;  // [2, 4, 6, 8]
```

## Data Structures

### Objects/Dictionaries

```jth
// Create JSON object
"name" "John" "age" 30 createJSON;  // {name: "John", age: 30}

// Get/Set operations
{name: "John"} "name" get;  // "John"
{} "key" "value" set;        // {key: "value"}
```

### Maps

```jth
// Create Map
"key1" "value1" "key2" "value2" createMap;  // Map(2)

// Operations on Maps
(new Map()) "key" "value" set;
(new Map([["key", "value"]])) "key" get;
```

### Sets

```jth
// Create Set
1 2 3 2 1 createSet;  // Set(3) {1, 2, 3}

// Operations on Sets
(new Set()) 1 (set, val) => [...set, set.add(val)];
```

## Iterators and Generators

```jth
// Create iterator
[1 2 3] iter;  // Returns iterator

// Get next value
[1 2 3] iter next;  // Iterator, 1

// Drain values from iterator
[1 2 3] iter 2 drain;  // 1, 2, Iterator

// Exhaust iterator to array
[1 2 3] iter exhaustIterator;  // [1, 2, 3]
```

## Ranges

```jth
// Exclusive range [start, end)
1 5 to;        // [1, 2, 3, 4]

// Include start, exclude end
1 5 fromTo;    // [1, 2, 3, 4]

// Exclude start, include end
1 5 toInc;     // [2, 3, 4, 5]

// Include both
1 5 fromToInc; // [1, 2, 3, 4, 5]

// Works with descending ranges
5 1 to;        // [5, 4, 3, 2]
```

## Statistics Functions

```jth
// Central tendency
1 2 3 4 5 mean;    // 3
1 2 3 4 5 median;  // 3
1 2 2 3 3 3 mode;  // 3
1 2 2 3 3 modes;   // [2, 3]

// Spread
1 2 3 4 5 populationVariance;  // 2
1 2 3 4 5 sampleVariance;       // 2.5
1 2 3 4 5 populationStandardDeviation;  // 1.414...
1 2 3 4 5 sampleStandardDeviation;      // 1.581...

// Percentiles
1 2 3 4 5 50 percentile;  // 3 (median)
1 2 3 4 5 fiveNumberSummary;  // [1, 2, 3, 4, 5]
```

## Control Flow

### Conditional Execution

```jth
// Using JavaScript ternary
true ("yes") ("no") (cond, yes, no) => cond ? yes : no;  // "yes"

// Using pause and conditional execution
true [inc] [dec] (cond, incFn, decFn) => cond ? incFn : decFn ! _;
```

### Loops and Iteration

```jth
// Step operations
1 10 stepUp;    // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
10 1 stepDown;  // [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

// Fibonacci sequence
0 1 fibonacci;  // 1, 0, 1
1 1 fibonacci fibonacci fibonacci;  // 3, 2, 5
```

## Custom Operators

Define your own operators at runtime:

```jth
// Define a custom operator
dupe * <sq>;   // Square operator
5 sq;          // 25

// More complex operator
swap - abs <delta>;
10 3 delta;    // 7
```

## JavaScript Interoperability

### Calling JavaScript

```jth
// Direct JavaScript values
(Math.random());
(Date.now());
(console.log("Hello from JS"));

// JavaScript functions as stack functions
1 2 3 ((...stack) => [...stack, stack.reduce((a,b) => a+b, 0)]);
// Stack: [1, 2, 3, 6]
```

### Environment Variables

```jth
"HOME" readEnv;  // Gets HOME environment variable
"MY_VAR" readEnv;  // Gets MY_VAR or undefined
```

## Imports and Exports

### Importing

```jth
// Import entire file
::import "./utils.mjs";

// Import default export
::import "./math.mjs" mathLib;

// Import named exports
::import "./helpers.mjs" {helper1 helper2};

// Rename imports
::import "./tools.mjs" {oldName:newName};
```

### Exporting

```jth
// Export variables
inc dupe ! ::: incDupe;
::export {incDupe};

// Rename exports
::export {incDupe:incrementAndDuplicate};

// Multiple exports
::export {func1 func2 func3:renamedFunc3};
```

## Advanced Features

### Promises and Async

```jth
// Execute and wait
[slowOperation] ! _;  // Waits for promise

// Execute, wait, and spread
[1 2 +] ! _ ...;  // Executes, waits, spreads result

// Async operations
(fetch("https://api.example.com/data")) _;
```

### Pausing and Delayed Execution

```jth
// Pause function to prevent execution
inc pause ::: delayedInc;
5 delayedInc;  // Function not executed yet
5 delayedInc <-;  // Now executes: 6

// Using arrays for pausing
[inc] ... ::: pausedInc;
5 pausedInc <-;  // 6
```

### Output

```jth
// Print without removing from stack
"Hello" @;  // Prints "Hello", keeps on stack

// Print and remove
"Hello" !@;  // Prints "Hello", removes from stack

// Print entire stack
1 2 3 @@;  // Prints [1, 2, 3]
```

## Best Practices

1. **Think in stacks**: Always visualize what's on the stack at each step
2. **Use meaningful variable names**: Even though the language is terse, clarity helps
3. **Compose small functions**: Build complex operations from simple ones
4. **Leverage JavaScript**: Don't reinvent the wheel - use JS when appropriate
5. **Test incrementally**: Use the REPL to test small pieces before combining

## Example Programs

### Factorial

```jth
// Recursive factorial using JavaScript
5 (n => n <= 1 ? 1 : n * factorial(n-1)) ::: factorial;
5 factorial;  // 120
```

### FizzBuzz

```jth
// Generate FizzBuzz for numbers 1-15
1 15 fromToInc (n => 
  n % 15 === 0 ? "FizzBuzz" :
  n % 3 === 0 ? "Fizz" :
  n % 5 === 0 ? "Buzz" : n
) map;
```

### Prime Checker

```jth
// Check if a number is prime
17 (n => {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}) ::: isPrime;
17 isPrime;  // true
```

## Debugging Tips

1. Use `@` to inspect the stack without modifying it
2. Use `count` to check stack depth
3. Break complex expressions into smaller parts
4. Use the REPL for interactive testing
5. Remember that functions in arrays are paused by default

## Conclusion

jth provides a unique blend of concatenative programming with JavaScript's ecosystem. Its stack-based nature encourages thinking about data flow in a different way, while maintaining full access to JavaScript's capabilities. The eager evaluation model (as of 0.2.0) makes the language more predictable and easier to reason about.

For a complete reference of all built-in functions, see [The Big List of Built-in Functions](big-list-of-built-in-functions.md).