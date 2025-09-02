# <img src="./logo.svg" alt="jth" style="height:32px" height="32">

**jth** (rhymes with "eighth") is an alternative syntax for JavaScript centered around sequential data processing. It is a concatenative, stack-oriented language that compiles to JavaScript and is compatible with existing libraries.

⚠️ **Jth is still very much a work in progress.** Many ideas around how the language should work are up in the air, and many bugs exist in the implementation. ⚠️

| Sub-Repositories                                                      | Version |
| --------------------------------------------------------------------- | ------- |
| [Jth Core](https://github.com/johnhenry/jth/tree/main/packages/core/) | 0.2.0   |
| [Jth CLI](https://github.com/johnhenry/jth/tree/main/packages/cli/)   | 0.2.0   |

## Features

*   **Concatenative:** Jth is a concatenative language, which means that programs are built by composing functions together. This leads to a highly modular and expressive style of programming.
*   **Stack-oriented:** Jth is a stack-oriented language, which means that all operations are performed on a stack of values. This simplifies the language and makes it easy to reason about the flow of data.
*   **JavaScript Interoperability:** Jth compiles to JavaScript, which means that it can be used with existing JavaScript libraries and frameworks. This makes it easy to integrate Jth into existing projects.
*   **Sequential Data Processing:** Jth is designed for sequential data processing. It provides a rich set of operators for working with arrays, iterators, and other sequential data structures.

## Installation

To use Jth, you'll need to install the Jth CLI:

```
npm install -g jth-cli
```

## Usage

You can run Jth code inline using `jth run`:

```
jth run -c '"hello world" @;'
```

This will print "hello world" to the console.

You can also run the Jth REPL with `jth repl`:

```
$ jth repl
Welcome to the jth repl...
[> 1 2 +
3
```

To compile a Jth file, use `jth compile`:

```
jth compile index.jth index.mjs
```

This will compile `index.jth` to `index.mjs`, which you can then run with `node`:

```
node index.mjs
```

## Documentation

Learn more about Jth here:

-   [Introduction](https://github.com/johnhenry/jth/tree/main/docs/introduction.md): A gentle introduction to the Jth language.
-   [Tooling](https://github.com/johnhenry/jth/tree/main/docs/tooling.md): Information about the Jth CLI and other tools.
-   [Examples](https://github.com/johnhenry/jth/tree/main/examples): A collection of example Jth programs.
-   [Big List of Built-in Functions](https://github.com/johnhenry/jth/tree/main/docs/big-list-of-built-in-functions.md): A comprehensive list of all the built-in functions in Jth.
-   [Change Log](https://github.com/johnhenry/jth/tree/main/docs/changelog.md): A log of all the changes to Jth.
-   [Road Map](https://github.com/johnhenry/jth/tree/main/docs/roadmap.md): The future plans for Jth.

## Contributing

Contributions are welcome! If you'd like to contribute to Jth, please fork the repository and submit a pull request. If you have any questions, please open an issue.

## Inspirations

Jth is inspired by a number of other languages, including:

-   [APL](https://en.wikipedia.org/wiki/APL_(programming_language))
-   [Forth](https://en.wikipedia.org/wiki/Forth_(programming_language))
-   [Joy](https://en.wikipedia.org/wiki/Joy_(programming_language))
-   [Factor](https://en.wikipedia.org/wiki/Factor_(programming_language))
-   [Cat](https://github.com/cdiggins/cat-language)
-   [Kitten](http://kittenlang.org/)

## License

Jth is licensed under the [ISC License](https://opensource.org/licenses/ISC).
