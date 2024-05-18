# The Big List of built in-functions

Like most stack-oritented languages, jth has a large number of built-in functions.

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

equavalent to

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

**skipN** instructs processor to

(Note, this only works when adding items to)

aliases:

- `->` skips 1 step
- `->N` skips N steps
- `->>` skips to the end

## Basic

### run (alt: !)

### spread (alt: ...)

### noop (alt: ∅)

Does noting to stack

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

Test if last to items on stack are equal

### coercedEqual (alt: ==)

Test if last to items on stack are equal (coerces)

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

## Basic

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
// results in 0.5
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

These functions operate on Arrays and other collectinons when
they are the last or next-to-last item on the array.

### push

Push last item on stack into penultimate if it's an array, set, or map

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

### getString

### getList

### getAll

### get

### set

## Iterator

### next

### drain

### iter

## Range

### numStack

### numStack

### to

### fromTo

### toInc

### fromToInc

## Staticstcs

### mean

### median

### mode

### modes

### populationVariance

### sampleVariance

### populationStandardDeviation

### sampleStandardDeviation

### percentile

### fiveNumberSummary

### fiveNumberSummaryB

## Utility Functions

### applyLastN

### attackStack

### binaryCollapse

## Misc

### Fibonacci

## Operators

|                      | Alias        | Description                                   |
| -------------------- | ------------ | --------------------------------------------- |
| **Static Operator**  |              |                                               |
| ∅                    | noop         | Do nothing to stack                           |
| @                    | peek         | View top item of stack                        |
| @@                   | peekAll      | View entire stack                             |
| +                    | plus         | Add last two numbers on stack                 |
| -                    | minus        | Subtract last two numbers on stack            |
| \*                   | times        | Multiply last two numbers on stack            |
| /                    | divide       | Divide last two numbers on stack              |
| \*\*                 | exp          | Raise [-1] to power of [-2]                   |
| =                    | equal        | Test if last two numbers are equal            |
| ==                   | coercedEqual | Test if last two numbers are equal (coerced)  |
| ++                   | inc          | Previous number +1                            |
| --                   | dec          | Previous number -1                            |
| ...                  | spread       | Expand iterator into stack                    |
| !                    | run          | Run functions within array                    |
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
| !!                   | not          | true if [-1] is falsy, true otherwise         |
| <<-                  | (n/a)        | Rewind to beginning                           |
| ->>                  | (n/a)        | Skip to end                                   |
| \_                   | wait         | resolve promise                               |
| \_\_                 | waitAll      | resolve all promises                          |
| **Dynamic Operator** |              |                                               |
| \*\*\* (3+ times)    | (n/a)        | Hyperperoperator on BigInts                   |
| /\*\*\* (3+ times)   | (n/a)        | Cumulative Hyperperoperator on BigInts        |
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
