import quiz, { equal } from "pop-quiz";
import transform from "./src/index.mjs";

await quiz("Strings can contain special characters", async function* () {
  const a = transform(`"www.com";`, false);
  const e = `await __PROCESS__("www.com")();`;
  yield equal(
    await transform(`"www.com";`, false),
    `await __PROCESS__("www.com")();`,
    "."
  );
  yield equal(
    await transform(`"person@website"`, false),
    `await __PROCESS__("person@website")();`,
    "@"
  );
  // TODO: TEST DOES NOT PASS
  // yield equal(
  //   await transform(`"hello world!"`, false),
  //   `await __PROCESS__("hello world!", __EXECUTE__(1));`,
  //   "!"
  // );
});

await quiz("Substacks are properly expanded", async function* () {
  yield equal(
    await transform(`[1 2 3]`, false),
    `await __PROCESS__( __PROCESS__(1,2,3))();`,
    "executed"
  );
  yield equal(
    await transform(`[1 2 3].`, false),
    `await __PROCESS__( __PROCESS__(1,2,3),__EXPAND__(),__EXECUTE__(1))();`,
    "expanded"
  );
  yield equal(
    await transform(`[1 2 3]!.`, false),
    `await __PROCESS__( __PROCESS__(1,2,3),__EXECUTE__(1),__EXPAND__(),__EXECUTE__(1))();`,
    "execute expanded"
  );
});
