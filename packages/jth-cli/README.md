# jth

> Previously published as `jth-lang@0.4.0` (itself renamed from `jth-cli@0.1.0`).

Command-line interface for compiling and running jth programs. The npm package is **`@johnhenry/jth`** (the binary it installs is `jth`).

> The unscoped npm name `jth` is owned by another user, which is why the package was originally shipped unscoped as `jth-lang`. Now that the CLI publishes under the `@johnhenry` scope, that constraint no longer applies — `@johnhenry/jth` is a distinct, available name regardless of who owns unscoped `jth`. The internal packages are published alongside it as `@johnhenry/jth-runtime`, `@johnhenry/jth-compiler`, …

## Installation

```bash
npm install -g @johnhenry/jth
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

By default the output is a **self-contained bundle** — @johnhenry/jth-runtime and @johnhenry/jth-stdlib are inlined, so `node output.mjs` works from any directory with nothing installed:

```bash
jth compile math.jth              # writes math.mjs (bundled)
jth compile math.jth output.mjs   # writes output.mjs (bundled)
node output.mjs                   # runs anywhere
```

With `--no-bundle`, the output keeps bare `"@johnhenry/jth-runtime"` / `"@johnhenry/jth-stdlib"` imports — smaller and readable, for projects that have the jth packages installed (also the right form for library modules that a bundled main program will import):

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
