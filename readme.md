# <picture> <img src="./logo.svg" alt="jth" style="height:32px">

⚠️WARNING⚠️
Jth is still very much a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

**Jth** (rhymes with "eighth")
is an alternative syntax for javascript
centered around squential data processing.

It compiles to javascript and
is compatibale with existing libraries.

## Quickstart

Install jth cli and run jth code inline:

```
npm install -g jth-cli
jth run -c '"hello world" @!;'
```

## Slower Quickstart

Install jth cli:

```
npm install -g jth-cli
```

Create jth file:

```
echo '"hello world" @!;' > index.jth
```

Compile jth file

```
jth compile index.jth index.mjs
```

Run compiiled file

```
node index.mjs
```

## Documentation

Learn more about jth here:

- [Introduction](./docs/introduction.md)
- [Tooling](./docs/tooling.md)

## Related Repositories

- [Jth core](https://github.com/johnhenry/jth/tree/main/packages/core/) -- core functionality for converting jth to javascript
- [Jth cli](https://github.com/johnhenry/jth/tree/main/packages/cli/) -- cli for running and compling jth code
- [Jth Tools](https://github.com/johnhenry/jth/tree/main/packages/tools/) -- tools for manipulating stacks in jth
- [Jth Stats](https://github.com/johnhenry/jth/tree/main/packages/stats/) -- statistical tools for manipulating stacks in jth

## See Also

### Languages with Similar Syntax

- https://en.wikipedia.org/wiki/Forth_(programming_language)
- https://en.wikipedia.org/wiki/Joy_(programming_language)
- https://en.wikipedia.org/wiki/Factor_(programming_language)

### Languages that Compile to JavaScript

- https://coffeescript.org/
- https://github.com/santoshrajan/lispyscript
- https://livescript.net/
