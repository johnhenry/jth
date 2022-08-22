# <img src="./logo.svg" alt="jth" style="height:32px" height="32">

⚠️WARNING⚠️
**Jth** is still _very much_ a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

Latest Version: [0.1.0](https://github.com/johnhenry/jth/tree/main/docs/changelog.md#0.1.0)

| Sub-Repositories                                                        | Version |
| ----------------------------------------------------------------------- | ------- |
| [Jth Core](https://github.com/johnhenry/jth/tree/main/packages/core/)   | 0.1.0   |
| [Jth CLI](https://github.com/johnhenry/jth/tree/main/packages/cli/)     | 0.1.0   |
| [Jth Tools](https://github.com/johnhenry/jth/tree/main/packages/tools/) | 0.0.0   |
| [Jth Stats](https://github.com/johnhenry/jth/tree/main/packages/stats/) | 0.0.0   |

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

- [Introduction](https://github.com/johnhenry/jth/tree/main/docs/introduction.md)
- [Tooling](https://github.com/johnhenry/jth/tree/main/docs/tooling.md)
- [Change Log](https://github.com/johnhenry/jth/tree/main/docs/changelog.md)
- [Road Map](https://github.com/johnhenry/jth/tree/main/docs/roadmap.md)

## Related Repositories

## See Also

### Languages with Similar Syntax

- https://en.wikipedia.org/wiki/Forth_(programming_language)
- https://en.wikipedia.org/wiki/Joy_(programming_language)
- https://en.wikipedia.org/wiki/Factor_(programming_language)

### Other languages that are ineroperabable with javascript

- https://coffeescript.org/
- https://github.com/santoshrajan/lispyscript
- https://livescript.net/
