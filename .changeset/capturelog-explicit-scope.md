---
"@johnhenry/jth-runtime": patch
"@johnhenry/jth-compiler": patch
"@johnhenry/jth-stdlib": patch
---

Fix `run(..., { captureLog: true })` losing output after the first `await` in browsers and Workers, where AsyncLocalStorage is shimmed. The capture sink is now attached explicitly to the run's stack (`Stack._sink`, inherited by the new `Stack#child()`), `peek`/`peek-all` write through the new `emitTo(stack, ...)`, and AsyncLocalStorage remains only as a fallback. Closes #68.
