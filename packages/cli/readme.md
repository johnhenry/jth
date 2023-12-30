# <img src="./logo.svg" alt="jth" style="height:32px" height="32"> - CLI

⚠️WARNING⚠️
**Jth** is still _very much_ a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

Commandline interface for interacting with jth.

## Installation

Dependencies: [node/npm](https://nodejs.org)

Install with command:

```
npm install -g jth-cli
```

## Command Line Usage

### run

Run jth file

```
jth run ./hello.jth
```

Run jth code

```
jth run --code '"Hello World!" @;'
```

### compile

Compile jth to javascript and print to console.

```
jth compile ./hello.jth
```

```
jth compile --code '"Hello World!" @;'
```

Compile jth to javascript and send to file.

```
jth compile ./hello.jth ./hello.mjs
```

```
jth compile --code '"Hello World!" @;' ./hello.mjs
```

Compile jth files in a given directory

```
jth compile src/
```

Compile jth files in a given directory to new directory. Copy other files

```
jth compile src/ dist/
```

### repl

Start a repl

⚠️WARNING⚠️ Broken. See https://github.com/johnhenry/jth/tree/main/docs/changelog.md

```
jth repl
[> "Hello World!" @
Hello World!
```
