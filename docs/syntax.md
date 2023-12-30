# Syntax

jth is designed to be almost 100% interoperable with JavaScript.

## Basic Syntax

Programs in **jth** consist mainly of
javascript entities laid out in a line
delimited by spaces.

```
"hello world" 1 2 3 limitN(2)(sum) @@;
```

Arrays and function calls are also
delimited by spaces rather than commas.

```
"<hello world>".slice(-1 -1) [1 2 3] pop @@;
```

Unless using the [repl](),
a semi-colon (";") is neccessary
to terminate the line.
This is true even for comments

```
"hello"
"world"
@@;
// logs "hello world"
```

## Standard library

You've noticed a number of
arbitrary words and symbols
above including: `limitN`, `sum`, `@@` and `pop`.

These are operators and functions
that are part of the language's
standard library.

You can learn more about their uses in
[The Big list of built in functions](big-list-of-built-in-functions.md).

## Comments

Lines beginning with `//` denote comments.
As mentioned above, even comments must end with a semicolon (";").

## Assingment

Assign the stack to a variable using the `:::` operator.

```
1 2 3 >>> numbers;
numbers ... 4 5 6 >>> moreNumbers;
moreNumbers @;
//logs [1, 2, 3, 4, 5, 6]
```

Assingment can be destructured using arrays and the spread operator

```
1 2 3 4 5 6 ::: [one two three ...rest];
```

The spread operator might be particularly useful when using the repl
to make a copy of the stack.

This "works" in the repl,
but depending what you want to do,
the circular reference may cause issues.

```
<] 1 2 3  x
<] 1 2 3 x
```

This causes no circular reference

```
<] 1 2 3  [...x]
<] 1 2 3 x
```

## Defining operators

Operators can be defined at run time.
The syntax is similar to assigning variables,
but surround the desired operator with '<' and '>'

The function on top of the stack will define the operator

```
->2 dupe multiply take(compose)  <^!^>;
drop 3 ^!^;
```

## Imports

Lines beginning with `::>>` denote imports.

JavasScript files can be imported.

Imports pointing to `.jth` files are be converted to `.mjs`
so they can be imported after build.

### Import a file

```
::>> "path/to/js/file"
```

### Import default from a file

```
::>> "path/to/js/file" defaultExportName;
```

### Import named exports from file

```
::>> "path/to/js/file" { namedExport };
```

### Rename export from file

```
::>> "path/to/js/file" { namedExport:renamedExport };
```

### Multiple Imports

```
::>> "path/to/js/file" defaultExportName { namedExport:renamedExport namedExport2 };
```

## Exports

Lines beginning with `<<::` denote exports.

Export existing variable, `existingVar`.

`<<:: {existingVar};`

Export existing variable, `existingVar` under name `renamedVar`;

`<<:: { existingVar:renamedVar };`

Export multiple variables;

`<<:: { existingVar:renamedVar, existingVar2 };`
