import quiz, { equal } from "pop-quiz";
import { transform } from "../index.mjs";

await quiz("Strings can contain special characters", async function* () {
  yield equal(
    await transform(`"www.com";`, { runtime: false, recordVar: false }),
    `processN(0,[])("www.com");`,
    "."
  );
  yield equal(
    await transform(`"person@website"`, { runtime: false, recordVar: false }),
    `processN(0,[])("person@website");`,
    "@"
  );
  yield equal(
    await transform(`"hello world!"`, { runtime: false, recordVar: false }),
    `processN(0,[])("hello world!");`,
    "!"
  );
});

await quiz("Substacks are properly expanded", async function* () {
  yield equal(
    await transform(`[1 2 3]`, { runtime: false, recordVar: false }),
    `processN(0,[])([1,2,3]);`,
    "executed"
  );
  yield equal(
    await transform(`[1 2 3] ...`, { runtime: false, recordVar: false }),
    `processN(0,[])([1,2,3],operators("..."));`,
    "expanded"
  );
  yield equal(
    await transform(`[1 2 3] ! ...;`, { runtime: false, recordVar: false }),
    `processN(0,[])([1,2,3],operators("!"),operators("..."));`
  );
});
