---
"@johnhenry/jth": minor
"@johnhenry/jth-repl": minor
---

Add a `--sandbox[=mode]` flag to `jth run` (file or `-c`) and `jth repl`. A bare `--sandbox` means `restricted`; `bare` (no stdlib) and a comma-separated operator allowlist are also accepted, and an invalid value is an error (fails closed). `jth run --sandbox` prints the final stack, one item per line. `startRepl()` now accepts `CreateEvaluatorOptions`, and the sandboxed evaluator no longer swallows output from allow-listed printing ops.
