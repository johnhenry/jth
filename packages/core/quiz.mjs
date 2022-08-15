import quiz, { equal } from "pop-quiz";
import transform from "./src/index.mjs";

await quiz("Strings can contain special characters", async function* () {
  yield equal(
    await transform(`"www.com";`, undefined, false),
    `await __PROCESS__(["www.com"]);`,
    "."
  );
  yield equal(
    await transform(`"person@website"`, undefined, false),
    `await __PROCESS__(["person@website"]);`,
    "@"
  );
  // TODO: TEST DOES NOT PASS
  yield equal(
    await transform(`"hello world!"`, undefined, false),
    `await __PROCESS__(["hello world!"]);`,
    "!"
  );
});

await quiz("Substacks are properly expanded", async function* () {
  yield equal(
    await transform(`[1 2 3]`, undefined, false),
    `await __PROCESS__([await __PROCESS__([1,2,3]),__EXPAND__,__APPLY__(1)]);`,
    "expanded"
  );
  yield equal(
    await transform(`[1 2 3].`, undefined, false),
    `await __PROCESS__([await __PROCESS__([1,2,3])]);`,
    "not expanded"
  );
  yield equal(
    await transform(`[1 2 3].!`, undefined, false),
    `await __PROCESS__([await __PROCESS__([1,2,3]),__EXPAND__,__APPLY__(1)]);`,
    "expanded"
  );
});
