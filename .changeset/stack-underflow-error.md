---
"@johnhenry/jth-types": minor
"@johnhenry/jth-runtime": minor
---

Add a typed `StackUnderflowError` (extends `JthRuntimeError`, code `STACK_UNDERFLOW`) thrown by `Stack.pop`, `popN`, `swap` and `dup`. It carries `expected`, `actual` and the failing `operator` name (attributed by `processN`); the generated code attaches the source `line`/`column`.
