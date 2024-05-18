# Introduction

What better way to start learning a language than with...

## Hello World

This program:

```jth
"Hello World" @;
```

prints "Hello World" to the console. Let's break it down into parts.

- `"Hello World"` is the string that we want to print. Adding it to the line puts it onto the stack.

- `@` is used to print the last item on the stack without removing it.

Finally, `;` the marks the end of the line.
Because jth supports multi-line expressions, lines must end with `;`.

### Storing

We can store the stack, or any part of it to a variable using `:::` to use in stacks that follow.

```jth
1 2 ::: [first second];
second first @@; /* puts 2 and 1 onto the stack */
```

Store the eitire stack as an array with `...`
Use `...` within a stack to spread it onto the stack.

```jth
1 2 @ ::: [...stack];
stack; /* puts [1,2] onto the stack */
stack ...; /*puts 1 and 2 onto the stack */
```

### Arrays

Another way to create an array is with `[` and `]`.

```jth
[1 2]; /* puts an array [1,2] onto the stack */
```

Functions within arrays are paused.

```jth
[1 2 +]; /* puts [2, 3, +] onto stack, rather than [3] */
```

```jth
[1 2 +] ... ; /* puts 1, 2 and + onto the stack */
```

### Array Execution

As the substack was initially paused, it can now be run by stepping back with `<-`.

```jth
[1 2 +] ... <-; /* puts 3 onto the stack */
```

Use `!` (or `run`) to execute an array immediately.
This creates a promise that resolves to the resulting array.

```jth
[1 2 *] !; /* puts Promise{[3]} on the stack  */
```

Resolve this promise with `_` (or `wait`).

```jth
[2 3 *] ! _; /* puts [6] onto the stack */
```

And like before, we can spread the array onto the stack

```jth
[2 3 *] ! _ ...; /* puts 6 onto the stack */
```

## Javascipt Values

Values wrapped in parentheses are processed as javascript values.

```jth
(Math.random()) (Math.random()) (Math.random()); /* puts two random numbers onto the stack */
```

Functions can be used as well.
Note a _stack function_'s signature:

- inputs: all items on the stack before it
- output: an array representing items to replace the stack with.

```jth
(Math.random()) (Math.random()) ((...m)=>m.map(x=>x>0.5?true:false));
```

## Pausing

It might be convenient to define values or functions and use them later;
but to prevent them from executing, you'll need to pause them either an array:

```jth
[((...stack) => [...stack, Math.random()]) ((...stack) => stack.map((i) => (i > 0.5 ? true : false)))] ... ::: [random mapper];
random random mapper;
```

Or by using the `pause` function.

```jth
pause(((...stack) => [...stack, Math.random()])) pause((...stack) => stack.map((i) => (i > 0.5 ? true : false))) ::: [random mapper];
random random mapper;
```

## Imports

You can also define functions in separate files using and import them.

```javascript
export const random = (...stack) => [...stack, Math.random()];
export const mapper = (...stack) => stack.map((i) => (i > 0.5 ? true : false));
```

```jth
::import "./randomstack.mjs" {random mapper};
random random mapper
```
