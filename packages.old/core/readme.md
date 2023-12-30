# <img src="./logo.svg" alt="jth" style="height:32px" height="32" > - core

⚠️WARNING⚠️
**Jth** is still _very much_ a work in progress.

- Many ideas around how the language _should_ work
  are up in the air.
- Many bugs exist in the implementation.

<hr >

Core transformation for jth.

## Installation

Dependencies: [node/npm](https://nodejs.org)

Install with command:

```
npm install jth-core
```

## In-File Usage

```javascript
import { transform } from "./core.mjs";
const jthCode = '"Hello World!" @!;';
const jsCode = await transform(jthCode);
console.log(jsCode);
```

## Changelog

### 0.0.0 - 1st 2nd 3rd 4th 5th 6th 7th jht! (initial release)

- Initial release

### 0.1.0 - Here comes the AST!

⚠️WARNING⚠️ Breaking Changes See https://github.com/johnhenry/jth/tree/main/docs/changelog.md
