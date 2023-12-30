# The Big List of built in-functions

## Homosynchronic functions

Homosynchronic functions wrap other functions
causing them to be processed in a "special" way.

### limitN

**limitN** limit the items
upon which a stack function may operate

### delayN

**delayN** delays calling of a function

until it is revisited via some mechanism such as **rewindN**

### persistN

**persistN** keeps function on stack such that

is may be called again via some mechanism such as **rewindN**

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

## Additive Stack Functions

### Basic

#### noop (alt: ∅)

Does noting to stack

#### peek (alt: @)

Logs last item on stack

#### peekAll (alt: @@)

Logs entire stack

#### dupe

Duplicates last item on stack

#### copy

Duplicates entire stack

### Math

#### sum

Return sum of numbers on stack.

#### product

Return product of numbers on stack.

#### difference

Return difference of numbers on stack.

#### quotient

Return quotient of numbers on stack.

### Logic

## Subtractive Stack Functions

### Basic

#### swap

Swap last two items on stack

#### reverse

Reverses all items on stack

#### drop

Removes last item from stack

#### dropHalf

Removes last half of stack (rounded up)

#### keepHalf

Removes last half of stack (rounded down)

### Math

#### plus (alt: +)

Replaces last two items with sum

#### subtract (alt: -)

Replaces last two items with difference

#### multiply (alt: \*)

Replaces last two items with product

#### divide (alt: /)

Replaces last two items with quotient

#### `/+` - addition across stack

#### `/-` - subtraction across stack

#### `/\*` - multiplication across stack

#### `//` - division across stack

#### `/**` - exponentiation across stack

#### `/***` - tetration across stack

### Array/Collection/Iterator Functions

These functions operate on Arrays and other collectinons when
they are the last or next-to-last item on the array.

#### push

Push last item on stack into penultimate if it's an array, set, or map

```
[1 2] 3 push;
// results in [1,2,3]
```

#### pop

Pops item from array and place it on the stack.

```
[1 2 3] pop;
// results in [1,2] 3
```

#### unshift

Unshift item preceding array onto array.

```
1 [2 3] unshift;
// results in [1,2,3]
```

#### shift

Shift item from array onto stack before it.

```
[1 2 3] shift;
// results in 1 [2, 3]
```

## Utility Functions

### applyLastN

### take

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
| &&                   | (n/a)        | true if [-1] and [-2] truthy, false otherwise |
| \|\|                 | (n/a)        | true if [-1] or [-2] truthy, false otherwise  |
| <<-                  | (n/a)        | Rewind to beginning                           |
| ->>                  | (n/a)        | Skip to end                                   |
| **Dynamic Operator** |              |                                               |
| \*\*\* (3+ times)    | (n/a)        | Hyperperoperator on BigInts                   |
| /\*\*\* (3+ times)   | (n/a)        | Cumulative Hyperperoperator on BigInts        |
| ->{N?}               | skip         | Skip Forward                                  |
| {N?}<-               | rewind       | Skip Back                                     |
| {F}+,-,\*,/          | (n/a)        | Successor Functions                           |

### Operator behavior

- `=` uses strict equailty (`===`) under the hood. Use `==` for coerced equality.
- `%` does not return negative numbers. Use `%%` if you want that behavior.
- `<`, `<=`, `>`, `=>` symbols are reversed
  - These mean the opposite of what they do in most languages;
    but since we compare from right to left,
    their meanings generally line up with expectations.
    - `1 < 2` is `true` in most JavaScript, C, etc. because 1 is _less_ than 2
    - `1 2 <` is `true` in jth because 2 is _greater_ than 1
