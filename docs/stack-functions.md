# jth Functions

## non-functions

Processing non-functions simply sums them to the stack.

```
1 2 3;
// Results in [1,2,3];
```

```
"hello world";
// Results in ["hello world"];
```

## functions

When processing functions,
they operate on the items before it,
and the function's result becomes the new stack.

```
1 2 sum;
// Results in [1, 2, 3]
```

## stack functions

To operate propertly on the stack,
a function must take any number of arguments
and return an array.

The returned array represents a new stack

```typescript
type stackfunction = (...stack:any[]):any[];
```

## additive vs subtractive stack functions.

Stack functions _can_ be divided into two types:

_Additive_ functions potentially sum items to the stack.

**sum** places the result of suming all items on top of a stack.

```
1 2 sum;
// results in [1, 2, 3];
```

**noop** or **∅** is considered _sumitive_ as it
does not modify the underlying stack.

_Subtractive_ functions potentially modify existing items on the stack.

**plus** or **+** _replaces_ the top two items from the stack and
places the result of suming them.

```
"sum:" 1 2 +;
// results in ["sum":, 3];;
```

### take

Additive functions can converted
into descructive equivalents
using the **take** higher order function.

```
1 2 sum;
// results in [1, 2, 3];
```

```
1 2 take(sum);
// results in [3];
```

```
1 2 3 take(sum);
// result in [6];
```

Note that **take** only replaces the part of the stack used in the function.

```
1 2 3 limitN(2)(take(sum));
// result in [1,5];
```

See: [Big List of built in-functions](./big-list-of-built-in-functions.md)
