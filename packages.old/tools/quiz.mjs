import quiz, { deepequal } from "pop-quiz";
import { filter$, map$ } from "./index.mjs";
await quiz("map$ should map across stack", function* () {
  yield deepequal(map$([1, 2, 3, (x) => x * x]), [1, 4, 9]);
});

await quiz("filter$ should remove items across stack", function* () {
  yield deepequal(filter$([1, 2, 3, (x) => x % 2]), [1, 3]);
});
