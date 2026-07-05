# jth-ai

AI integration helpers for the jth runtime via Ollama — a **JavaScript-only helper library**, not a jth op package.

> **Scope: JS-only.** Unlike `jth-html`, importing `jth-ai` does **not** register any operator names in the jth registry — there are no `infer`/`chat` words callable from a `.jth` program, and `::import "jth-ai";` registers nothing. Network access is deliberately kept out of the default jth vocabulary. The exports below are factory functions that *produce* stack operators for you to drive explicitly from JavaScript via `processN` (or to register yourself under names of your choosing).

## Installation

```bash
npm install jth-ai
```

Requires the `ollama` npm package as a peer dependency and a running Ollama instance.

## API

### `createInfer(ollama) -> infer(config?)`

Factory that takes an Ollama client instance and returns an `infer` function. Call `infer(config)` to produce a variadic stack operator that sends a chat completion request.

- **Stack effect:** `( ...messages -- response )` where messages are `{ role, content }` objects.
- **Config:** `{ model: "qwen3:0.6b", think: false }` (both optional).

### `conversation(roles?) -> operator`

Create a variadic stack operator that converts stack items (strings) into a messages array. Roles alternate through the provided array (default: `["user", "assistant"]`).

- **Stack effect:** `( ...strings -- messagesArray )`

### `extractContent -> operator`

A unary stack operator that extracts the content string from an Ollama chat response object.

- **Stack effect:** `( response -- contentString )`

## Usage

```js
import { Ollama } from "ollama";
import { Stack, processN } from "jth-runtime";
import { createInfer, conversation, extractContent } from "jth-ai";

const ollama = new Ollama();
const infer = createInfer(ollama);

const stack = new Stack();

// Build a conversation and send it
await processN(stack, [
  "What is 2+2?",          // push a string
  conversation(["user"]),   // convert to [{ role: "user", content: "..." }]
  infer({ model: "qwen3:0.6b" }), // send to Ollama
  extractContent,           // pull out the response text
]);

console.log(stack.peek()); // "4" (or similar LLM response)
```

---

See the root [README](../../README.md) for full jth language documentation.
