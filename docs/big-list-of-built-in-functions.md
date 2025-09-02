# The Big List of built in-functions

Like most stack-oriented languages, jth has a large number of built-in functions.

## Homosynchronic functions

Homosynchronic functions wrap other functions
causing them to be processed in a "special" way.

### delayN

**delayN** delays calling of a function

until it is revisited via some mechanism such as **rewindN**

### pause

**pause** delays calling of a function once until it is revisited via some mechanism such as **rewindN**

```jth
1 3 pause(*);
```

equivalent to

```jth
1 3 delayN(1)(*);
```

### limitN

**limitN** limit the items upon which a stack function may operate

```jth
1 2 3 4 5 6 7 8 9 10 limit(3)(sum);
1 2 3 4 5 6 7 27
```

### persistN

**persistN** keeps function on stack such that is may be called again via some mechanism such as **rewindN**

```jth
1 3 persistN(1)(*);
```

### rewindN

**rewindN** move back in execution
to call functions that still exist on the stack
via mechanisms such as **delayN** or **persistN**

aliases:

- `<-` rewinds 1 steps
- `N<-` rewinds N steps
- `<<-` rewinds to the beginning

### skipN

**skipN** instructs processor to skip the next `n` items.

aliases:

- `->` skips 1 step
- `->N` skips N steps
- `->>` skips to the end

## Basic

### run (alt: !)

### spread (alt: ...)

### noop (alt: ∅)

Does nothing to stack

### peek (alt: @)

Logs last item on stack

### peekAll (alt: @@)

Logs entire stack

### dupe

Duplicates last item on stack

```jth
1 dupe;
// results in 1 1
```

### copy

Duplicates entire stack

```jth
1 2 3 copy;
// results in 1 2 3 1 2 3
```

## Logic

### and (alt: /&&)

Ands last two items on the stack

### or (alt: /\|\|)

Ors last two items on the stack

### not (alt: !!)

Negates last item on stack

### equal (alt: =)

Test if last two items on stack are equal

### coercedEqual (alt: ==)

Test if last two items on stack are equal (coerces)

### lt (alt: >)

Tests if last item is less than penultimate

### lte (alt: >=)

Tests if last item is less than or equal to penultimate

### gt (alt: <)

Test if last item is greater than penultimate

### gte (alt: <=)

Test if last item is greater than or equal to penultimate

### spaceship (alt: <=>)

Compares last two items on stack and returns -1, 0, or 1

### xor

Performs exclusive OR on the last two items.

```jth
true false xor;
// results in true
```

### xorAll

Performs exclusive OR on all items on the stack.

### nand

Performs NAND (NOT AND) on the last two items.

```jth
true true nand;
// results in false
```

### nandAll

Performs NAND on all items on the stack.

### nor

Performs NOR (NOT OR) on the last two items.

```jth
false false nor;
// results in true
```

### norAll

Performs NOR on all items on the stack.

## Stack Manipulation

### swap

Swap last two items on stack

```jth
1 2 swap;
// results in 2 1
```

### reverse

Reverses all items on stack

```jth
1 2 3 reverse;
// results in 3 2 1
```

### drop

Removes last item from stack

```jth
1 2 3 drop;
// results in 1 2
```

### dropHalf

Removes last half of stack (rounded up)

```jth
1 2 3 4 5 6 7 8 9 10 dropHalf;
// results in 1 2 3 4 5
```

### keepHalf

Removes last half of stack (rounded down)

```jth
1 2 3 4 5 6 7 8 9 10 keepHalf;
// results in 6 7 8 9 10
```

## Math

### sum (alt: Σ)

Replaces all numbers on stack with sum

```jth
1 2 3 sum;
// results in 6
```

### product (alt: Π)

Replaces all numbers on stack with product

```jth
1 2 3 product;
// results in 6
```

### plus (alt: +)

Replaces last two items with sum

```jth
1 2 +;
// results in 3
```

### subtract (alt: -)

Replaces last two items with difference

```jth
2 1 -;
// results in -1
```

### multiply (alt: \*)

Replaces last two items with product

```jth
2 3 *;
// results in 6
```

### divide (alt: /)

Replaces last two items with quotient

```jth
6 3 /;
// results in 2
```

### exp (alt: \*\*)

Replaces last two items with exponentiation result

```jth
2 3 exp;
// results in 9
```

### tetration (alt: \*\*\*)

Replaces last two items with tetration result

```jth
2 3 ***;
// results in 27
```

### pentration (alt: \*\*\*\*)

Replaces last two items with pentration result

```jth
2 3 ****;
// results in 7625597484987
```

## Array

These functions operate on Arrays and other collections when
they are the last or next-to-last item on the stack.

### push

Push last item on stack into penultimate if it's an array.

```jth
[1 2 3] 4 push;
// results in [1, 2, 3, 4]
```

### pop

Pop last item from array and put it on stack.

```jth
[1 2 3 4] pop;
// results in [1, 2, 3] 4
```

### shift

Remove first item from array and put it on stack.

```jth
[1 2 3 4] shift;
// results in 1 [2, 3, 4]
```

### unshift

Add item to beginning of array.

```jth
[2 3 4] 1 unshift;
// results in [1, 2, 3, 4]
```

### flatten

Flatten a nested array by one level.

```jth
[[1 2] [3 4]] flatten;
// results in [1, 2, 3, 4]
```

```
[1 2] 3 push;
// results in [1,2,3]
```

### pop

Pops item from array and place it on the stack.

```
[1 2 3] pop;
// results in [1,2] 3
```

### unshift

Unshift item preceding array onto array.

```
1 [2 3] unshift;
// results in [1,2,3]
```

### shift

Shift item from array onto stack before it.

```
[1 2 3] shift;
// results in 1 [2, 3]
```

### suppose

Suppose last item is an array, set, or map and push it onto stack.

```
0 [1 2 3] suppose;
// results in 0 1 2 3
```

## Dict

### get

Gets a value from a dictionary.

```jth
{ name: "jth", version: "0.2.0" } "name" get;
// results in "jth"
```

### set

Sets a value in a dictionary.

```jth
"name" "jth" "version" "0.2.0" 2 set;
// results in { name: "jth", version: "0.2.0" }
```

## Iterator

### next

Gets the next value from an iterator.

### drain

Drains `n` values from an iterator to the stack.

### iter

Creates an iterator from an iterable.

## Range

### to

Creates a range of numbers, excluding the start and end values.

### fromTo

Creates a range of numbers, including the start value but excluding the end value.

### toInc

Creates a range of numbers, excluding the start value but including the end value.

### fromToInc

Creates a range of numbers, including the start and end values.

## Statistics

### mean

Calculates the mean of the stack.

### median

Calculates the median of the stack.

### mode

Calculates the mode of the stack.

### modes

Calculates the modes of the stack.

### populationVariance

Calculates the population variance of the stack.

### sampleVariance

Calculates the sample variance of the stack.

### populationStandardDeviation

Calculates the population standard deviation of the stack.

### sampleStandardDeviation

Calculates the sample standard deviation of the stack.

### percentile

Calculates the percentile of the stack.

### fiveNumberSummary

Calculates the five number summary of the stack.

### fiveNumberSummaryB

Calculates the five number summary of the stack (version B).

## Utility Functions

### applyLastN

Applies the last `n` items from the stack as arguments to a function.

### attackStack

A helper for creating stack functions.

### binaryCollapse

Collapses the stack by repeatedly applying a binary function.

## Misc

### Fibonacci

Generates the next number in the fibonacci sequence.

### exhaustIterator

Exhausts an iterator, spreading all its values onto the stack.

## Math Extensions

### abs

Returns the absolute value of the last item on the stack.

```jth
-5 abs;
// results in 5
```

### gcd

Calculates the greatest common divisor of the last two items on the stack.

```jth
12 8 gcd;
// results in 4
```

### gcdAll

Calculates the greatest common divisor of all items on the stack.

### lcm

Calculates the least common multiple of the last two items on the stack.

```jth
4 6 lcm;
// results in 12
```

### lcmAll

Calculates the least common multiple of all items on the stack.

## Math Functions (Extended)

### sqrt

Returns the square root of the last item on the stack.

```jth
9 sqrt;
// results in 3
```

### floor

Rounds down to the nearest integer.

```jth
3.7 floor;
// results in 3
```

### ceil

Rounds up to the nearest integer.

```jth
3.2 ceil;
// results in 4
```

### round

Rounds to the nearest integer.

```jth
3.5 round;
// results in 4
```

### log

Returns the natural logarithm (base e).

```jth
2.718281828 log;
// results in ~1
```

### log10

Returns the base-10 logarithm.

```jth
100 log10;
// results in 2
```

### log2

Returns the base-2 logarithm.

```jth
8 log2;
// results in 3
```

### sin

Returns the sine of the angle (in radians).

```jth
1.5708 sin;  // π/2 radians
// results in ~1
```

### cos

Returns the cosine of the angle (in radians).

```jth
3.14159 cos;  // π radians
// results in ~-1
```

### tan

Returns the tangent of the angle (in radians).

```jth
0.7854 tan;  // π/4 radians
// results in ~1
```

## Data Types

### createJSON

Creates a JSON string from the items on the stack. Takes a count parameter.

```jth
"name" "jth" "version" "0.2.0" 2 createJSON;
// results in '{"name":"jth","version":"0.2.0"}'
```

### createMap

Creates a JavaScript Map from key-value pairs on the stack.

```jth
"key1" "value1" "key2" "value2" 2 createMap;
// results in Map with 2 entries
```

### createSet

Creates a JavaScript Set from items on the stack.

```jth
1 2 3 3 createSet;
// results in Set {1, 2, 3}
```

### readEnv

Reads an environment variable by name.

```jth
"PATH" readEnv;
// results in the PATH environment variable value
```

## Execution Control

### execute

Executes a function from the stack.

### executeWait

Executes a function and waits for it to resolve (for async operations).

### executeWaitSpread

Executes a function, waits for it to resolve, and spreads the result onto the stack.

## Operators

|                      | Alias        | Description                                   |
| -------------------- | ------------ | --------------------------------------------- |
| **Static Operator**  |              |                                               |
| ∅                    | noop         | Do nothing to stack                           |
| @                    | peek         | View top item of stack                        |
| @@                   | peekAll      | View entire stack                             |
| +                    | plus         | Add last two numbers on stack                 |
| -                    | subtract     | Subtract last two numbers on stack            |
| \*                   | multiply     | Multiply last two numbers on stack            |
| /                    | divide       | Divide last two numbers on stack              |
| \*\*                 | exp          | Raise [-1] to power of [-2]                   |
| =                    | equal        | Test if last two items are equal              |
| ==                   | coercedEqual | Test if last two items are equal (coerced)    |
| ++                   | inc          | Previous number +1                            |
| --                   | dec          | Previous number -1                            |
| ...                  | spread       | Expand iterator into stack                    |
| $                    | run          | Run functions within array                    |
| <                    | gt           | true if [-1] > [-2], false otherwise          |
| <=                   | gte          | true if [-1] >= [-2], false otherwise         |
| >                    | lt           | true if [-1] < [-2], false otherwise          |
| >=                   | lte          | true if [-1] <= [-2], false otherwise         |
| <=>                  | spaceship    | -1 if [-1] <= [-2], 0 if equal, 1 otherwise   |
| /&&                  | and          | Array-wise and                                |
| /\|\|                | or           | Array-wise or                                 |
| %                    | mod          | Positive result only modulus                  |
| %%                   | modulus      | Mixed result moduls (JS Default)              |
| &&                   | and          | true if [-1] and [-2] truthy, false otherwise |
| \|\|                 | or           | true if [-1] or [-2] truthy, false otherwise  |
| !                    | not          | true if [-1] is falsy, true otherwise         |
| <<-                  | (n/a)        | Rewind to beginning                           |
| ->>                  | (n/a)        | Skip to end                                   |
| \_                   | wait         | resolve promise                               |
| \_\_                 | waitAll      | resolve all promises                          |
| **Dynamic Operator** |              |                                               |
| \*\*\* (3+ times)    | (n/a)        | Cumulative (n+1) Hyperperoperator             |
| ->{N?}               | skip         | Skip Forward                                  |
| {N?}<-               | rewind       | Skip Back                                     |
| {F}+,-,\*,/          | (n/a)        | Successor Functions                           |

### Operator behavior

- `=` uses strict equailty (`===`) under the hood. Use `==` for coerced equality.
- `%` does not return negative numbers. Use `%%` if you want that behavior.
- `<`, `<=`, `>`, `=>` symbols are "reversed"
  - These mean the opposite of what they do in most languages;
    but since we compare from right to left,
    their meanings generally line up with expectations.
    - `1 < 2` is `true` in most JavaScript, C, etc. because 1 is _less_ than 2
    - `1 2 <` is `true` in jth because 2 is _greater_ than 1
