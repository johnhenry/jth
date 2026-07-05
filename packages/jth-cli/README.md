# jth-lang

Command-line interface for compiling and running jth programs. The npm package is **`jth-lang`** (the binary it installs is `jth`).

> Renamed from `jth-cli`: the npm name `jth` is taken, so the CLI ships as `jth-lang`. The internal packages keep their names (`jth-runtime`, `jth-compiler`, …).

## Installation

```bash
npm install -g jth-lang
```

## Commands

### `jth run <file>`

Compile and execute a `.jth` file. The program is bundled into a self-contained temp module (in the OS temp dir — nothing is written next to your sources) and executed with plain node.

```bash
jth run hello.jth
```

### `jth run -c '<code>'`

Compile and execute inline jth code.

```bash
jth run -c '"hello world" peek;'
```

### `jth compile <file> [output]`

Compile a `.jth` file to a `.mjs` JavaScript module. If no output path is given, the output filename is derived from the input (replacing `.jth` with `.mjs`).

By default the output is a **self-contained bundle** — jth-runtime and jth-stdlib are inlined, so `node output.mjs` works from any directory with nothing installed:

```bash
jth compile math.jth              # writes math.mjs (bundled)
jth compile math.jth output.mjs   # writes output.mjs (bundled)
node output.mjs                   # runs anywhere
```

With `--no-bundle`, the output keeps bare `"jth-runtime"` / `"jth-stdlib"` imports — smaller and readable, for projects that have the jth packages installed (also the right form for library modules that a bundled main program will import):

```bash
jth compile --no-bundle math.jth
```

### `jth compile -c '<code>'`

Compile inline jth code and print the resulting JavaScript to stdout (always the unbundled form, for inspection).

```bash
jth compile -c '1 2 + peek;'
```

### `jth repl`

Start the interactive REPL.

### Flags

| Flag              | Description                                |
|-------------------|--------------------------------------------|
| `--no-bundle`     | (compile) emit bare-specifier output       |
| `--version`, `-v` | Print version number                       |
| `--help`, `-h`    | Print help message                         |

## Examples

```bash
# Run a file
jth run program.jth

# Quick one-liner
jth run -c '5 3 + peek;'

# Portable compiled artifact
jth compile program.jth && node program.mjs

# Inspect compiled output
jth compile -c '1 2 + dup * peek;'
```

---

See the root [README](../../README.md) for full jth language documentation.
