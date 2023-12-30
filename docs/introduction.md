# Introduction

What better way to start learning a language than with...

## Hello World

This program:

```javascript
"Hello World" @;
```

prints "Hello World" to the console. Let's break it down into parts.

- `"Hello World"` is the string that we want to print. Adding it to the line puts it on the stack.

- `@` is used to print the last item on the stack.

Finally, `;` the marks the end of the line.
Because jth supports multi-line expressions, lines must end with `;`.

### Storing

We can store the stack, or any part of it to a variable using `:::` to use in stacks that follow.

This program:

```javascript
"Hello World" "How are you today?" @@ ::: [first second];
second first @@;
```

(Note that @ doesn't modify the stack... just displays it)

prints "How are you today? Hello world." to the console.

When storing the full stack, it's an array. Expand it with `.` to add its values to the stack (remember to add the `!` operator).

```javascript
"Hello World" "How are you today?" @ -> stack;
stack @; /* prints array */
stack ... @@; /*prints individual items */
```

### Substacks

`[` and `]` can denote a _sub-program_.

Alone they are a single object.

```javascript
// [3 4 5] count$! @!;/*prints 1*/
```

They can be expaned into the current stack:

```javascript
// [3 4 5] ... @@;/*prints 3 4 5*/
```

They can be executed:

```javascript
// [3 4 /*] ... <- @@;/*prints 12*/
// [3 4 /*] ! @;/*prints [12]*/
```

## stack functions and composition.

As mentioned before, `!` applies a function to the stack before it.

These functions, "stack functions", take an array as an argument and return an array as an argument.

A number of standard [stack functions](./api.md#stack-functions) are available.

The easiet way to create functions is to create it in javascript:

```javascript
export const sum$ = (...stack) => {
  return [stack.reduce((a, b) => a * b, 1)];
};
export const dupe$ = (...stack) => {
  return [...stack, stack[stack.length - 1]];
};
```

and import it into an jth file.

```javascript
import { sum$, dupe$ } from "...";
1 2 3 sum$! @!; /* prints 6 */
1 2 3 dupe$! @!; /* prints 1 2 3 3 */
```

You can also compose functions using `!`.

```javascript
import { sum$, dupe$, product$ } from "...";
1 2 3 sum$ @; /* prints 6 */
hold(dupe$) hold(product$) compose ::: [square$];
3 square$; /* prints "9" */
```

## Javascript Compatibiltiy

### Imports/Exports

The syntax for importing and exporting objects is identical to that of javascript with two exceptions:

- lines must end with a semicolon.
- references to "jth" files are changed to "mjs" files during transformation.

### Expressions

Javascript expressions wrapped in ` (``) `are evaluated as-is.

The following programs maps two random numbes to truth values and prints them.

```javascript
(Math.random()) (Math.random()) stack=>stack.map(x=>x>0.5?true:false) !! @!!;
```
