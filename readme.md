# <img src="./logo.svg" alt="jth" style="height:32px" height="32">

⚠️WARNING⚠️
**Jth** is still _very much_ a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

Latest Version: [0.1.0](https://github.com/johnhenry/jth/tree/main/docs/changelog.md#0.1.0)

| Sub-Repositories                                                      | Version |
| --------------------------------------------------------------------- | ------- |
| [Jth Core](https://github.com/johnhenry/jth/tree/main/packages/core/) | 0.2.0   |
| [Jth CLI](https://github.com/johnhenry/jth/tree/main/packages/cli/)   | 0.2.0   |

**Jth** (rhymes with "eighth")
is an alternative syntax for javascript
centered around squential data processing.

It compiles to javascript and
is compatibale with existing libraries.

## Quickstart

Install jth cli and run jth code inline using `jth run`:

```
npm install -g jth-cli
jth run -c '"hello world" @;'
```

Or run the repl with `jth repl`

```
$ jth repl
Welcome to the jth repl...
[> 1 2 +
3
```

## Slower Quickstart

Install jth cli:

```
npm install -g jth-cli
```

Create jth file:

```
echo '"hello world" @;' > index.jth
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

## See Languages

[Point-Free/Tacit](https://en.wikipedia.org/wiki/Tacit_programming) |
[Concatenative](<https://en.wikipedia.org/wiki/Factor_(programming_language)>) |
[Array-based](https://en.wikipedia.org/wiki/Array_programming) |
[Stack-oriented](https://en.wikipedia.org/wiki/Stack-oriented_programming) |
[Homoiconicity](https://en.wikipedia.org/wiki/Homoiconicity)

- https://en.wikipedia.org/wiki/APL_(programming_language)
- https://en.wikipedia.org/wiki/J_(programming_language)
- https://en.wikipedia.org/wiki/Forth_(programming_language)
- https://thinking-forth.sourceforge.net/
- https://en.wikipedia.org/wiki/Joy_(programming_language)
  - https://hypercubed.github.io/joy/joy.html
  - https://news.ycombinator.com/item?id=23049445
- https://en.wikipedia.org/wiki/Factor_(programming_language)
  - https://factorcode.org/
  - https://www.youtube.com/watch?v=f_0QlhYlS8g&ab_channel=GoogleTechTalks
- https://github.com/cdiggins/cat-language
  - https://web.archive.org/web/20150205081218/http://cat-language.com/manual.html
- http://kittenlang.org/
- https://en.wikipedia.org/wiki/Dc_(computer_program)
- https://en.wikipedia.org/wiki/PostScript

#### Javascript Interoperable

- https://coffeescript.org/
- https://github.com/santoshrajan/lispyscript
- https://livescript.net/

#### Other Inspirations

- https://en.wikipedia.org/wiki/TI-BASIC_83
