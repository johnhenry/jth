# jth-cli

Command-line interface for compiling and running jth programs.

## Installation

```bash
npm install -g jth-cli
```

## Commands

### `jth run <file>`

Compile and execute a `.jth` file.

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

```bash
jth compile math.jth              # writes math.mjs
jth compile math.jth output.mjs   # writes output.mjs
```

### `jth compile -c '<code>'`

Compile inline jth code and print the resulting JavaScript to stdout.

```bash
jth compile -c '1 2 + peek;'
```

### Flags

| Flag              | Description          |
|-------------------|----------------------|
| `--version`, `-v` | Print version number |
| `--help`, `-h`    | Print help message   |

## Examples

```bash
# Run a file
jth run program.jth

# Quick one-liner
jth run -c '5 3 + peek;'

# Inspect compiled output
jth compile -c '1 2 + dup * peek;'
```

---

See the root [README](../../README.md) for full jth language documentation.
