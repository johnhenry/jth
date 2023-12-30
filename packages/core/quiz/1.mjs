// deno-lint-ignore-file no-fallthrough
import quiz from "pop-quiz";
import { deepequal, equal } from "pop-quiz/assertions";
import unique from "pop-quiz/unique";
import { processN } from "../index.mjs";
const process = processN();
import extractGlobal from "../external/extract-global.mjs";

import * as __CORE__ from "../core.mjs";
import _ from "../operators.mjs";
extractGlobal(__CORE__);

const [T0, T1, T2, T3] = unique();

await quiz("basic stack", function* () {
  yield deepequal(process(), []);
  yield deepequal(process(T0), [T0]);
  yield deepequal(process(T0, T1), [T0, T1]);
  yield deepequal(process(T0, T1, T2), [T0, T1, T2]);
});

await quiz("function application", function* () {
  yield deepequal(process(take(collect)), [[]]);
  yield deepequal(process(T0, take(collect)), [[T0]]);
  yield deepequal(process(T0, T1, take(collect)), [[T0, T1]]);
  yield deepequal(process(T0, T1, T2, take(collect)), [[T0, T1, T2]]);
});
await quiz("arrays", function* () {
  yield deepequal(process([]), [[]]);
  yield deepequal(process([T0], T1), [[T0], T1]);
  yield deepequal(process(T0, [T1]), [T0, [T1]]);
});

await quiz("delayed function application (delayN)", function* () {
  yield deepequal(process(delayN()(take(collect)), back), [[]]);
  yield deepequal(process(T0, delayN()(take(collect)), back), [[T0]]);
  yield deepequal(process(T0, T1, delayN()(take(collect)), back), [[T0, T1]]);
  yield deepequal(process(T0, T1, T2, delayN()(take(collect)), back), [
    [T0, T1, T2],
  ]);
  yield deepequal(process(pause(take(collect)), back), [[]]);
  yield deepequal(process(T0, pause(take(collect)), back), [[T0]]);
  yield deepequal(process(T0, T1, pause(take(collect)), back), [[T0, T1]]);
  yield deepequal(process(T0, T1, T2, pause(take(collect)), back), [
    [T0, T1, T2],
  ]);

  yield deepequal(process(hold(take(collect)), back), [[]]);
  yield deepequal(process(T0, hold(take(collect)), back), [[T0]]);
  yield deepequal(process(T0, T1, hold(take(collect)), back), [[T0, T1]]);
  yield deepequal(process(T0, T1, T2, hold(take(collect)), back), [
    [T0, T1, T2],
  ]);

  yield deepequal(process([take(collect)], spread, back), [[]]);
  yield deepequal(process(T0, [take(collect)], spread, back), [[T0]]);
  yield deepequal(process(T0, T1, [take(collect)], spread, back), [[T0, T1]]);
  yield deepequal(process(T0, T1, T2, [take(collect)], spread, back), [
    [T0, T1, T2],
  ]);

  yield deepequal(process([take(collect)], run, spread), [[]]);
  yield deepequal(process(T0, [T0, take(collect)], run, spread), [T0, [T0]]);
  yield deepequal(process(T0, T1, [T0, T1, take(collect)], run, spread), [
    T0,
    T1,
    [T0, T1],
  ]);
  yield deepequal(
    process(T0, T1, T2, [T0, T1, T2, take(collect)], run, spread),
    [T0, T1, T2, [T0, T1, T2]]
  );
});

await quiz("dropping", function* () {
  yield deepequal(process(dropN()), []);
  yield deepequal(process(T0, T1, T2, dropN()), []);
  yield deepequal(process(T0, T1, T2, dropN(1)), [T0, T1]);
  yield deepequal(process(T0, T1, T2, dropN(2)), [T0]);
  yield deepequal(process(T0, T1, T2, dropN(3)), []);
});

await quiz("dupe", function* () {
  yield deepequal(process(dupe), [undefined, undefined]);
  yield deepequal(process(T0, dupe), [T0, T0]);
  yield deepequal(process(T0, T0, dupe), [T0, T0, T0]);
  yield deepequal(process(T0, dupe, dupe), [T0, T0, T0]);
});

await quiz("limit", function* () {
  yield deepequal(process(T0, T1, T2, limitN()(take(collect)), back), [
    [T0, T1, T2],
  ]);
  yield deepequal(process(T0, T1, T2, limitN(3)(take(collect)), back), [
    [T0, T1, T2],
  ]);
  yield deepequal(process(T0, T1, T2, limitN(2)(take(collect)), back), [
    T0,
    [T1, T2],
  ]);
  yield deepequal(process(T0, T1, T2, limitN(1)(take(collect)), back), [
    T0,
    T1,
    [T2],
  ]);
  yield deepequal(process(T0, T1, T2, limitN(0)(take(collect)), back), [
    T0,
    T1,
    T2,
    [],
  ]);
});

await quiz("and/or", function* () {
  yield deepequal(process(true, true, true, and), [true, true, true]);
  yield deepequal(process(true, true, false, and), []);
  yield deepequal(process(true, false, true, and), []);
  yield deepequal(process(false, false, false, and), []);

  yield deepequal(process(true, true, true, or), [true, true, true]);
  yield deepequal(process(true, true, false, or), [true, true]);
  yield deepequal(process(true, false, true, or), [true, false, true]);
  yield deepequal(process(false, false, false, or), []);
});

await quiz("map/filter/reduce/binFold", function* () {
  yield deepequal(
    process(
      T0,
      T1,
      T2,
      map((t) => [t])
    ),
    [[T0], [T1], [T2]]
  );
  yield deepequal(
    process(
      T0,
      T1,
      T2,
      T1,
      T0,
      filter((t) => t !== T2)
    ),
    [T0, T1, T1, T0]
  );
  yield deepequal(
    process(
      T0,
      T1,
      T2,
      T3,
      reduce(
        (a, b) => (a === Symbol.for("null") ? [b] : [a, b]),
        Symbol.for("null")
      )
    ),
    [[[[[T3], T2], T1], T0]]
  );

  yield deepequal(
    process(
      T0,
      T1,
      T2,
      T3,
      hold((a, b) => [[b, a]]),
      binFold
    ),
    [[T0, [T1, [T2, T3]]]]
  );
});

await quiz("keepIf", function* () {
  yield deepequal(process(T0, true, keepIf), [T0]);
  yield deepequal(process(T0, false, keepIf), []);
  yield deepequal(
    process([() => [T1]], [() => [T0]], true, keepIfElse, spread, back),
    [T0]
  );
  yield deepequal(
    process([() => [T1]], [() => [T0]], false, keepIfElse, spread, back),
    [T1]
  );
  yield deepequal(
    process(
      skipN(3)(keepIfElse),
      () => [T1],
      () => [T0],
      true,
      back
    ),
    [T0]
  );
  yield deepequal(
    process(
      skipN(3)(keepIfElse),
      () => [T1],
      () => [T0],
      false,
      back
    ),
    [T1]
  );
});

await quiz("fibonacci", function* () {
  yield deepequal(
    process(0, 1, ...Array(31).fill(fibonacci)),
    [
      0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597,
      2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418,
      317811, 514229, 832040, 1346269, 2178309,
    ]
  );
});

await quiz("steps", function* () {
  yield deepequal(
    process(8, ...Array(8).fill(stepDown()), ...Array(8).fill(stepUp())),
    [8, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6, 7, 8]
  );
});

await quiz("factorial", function* () {
  const in0 = [hold(stepDown(0)), loop(loops.LARGE)];
  const in1 = [1, take(fromToInc)];
  const ops = [hold((a, b) => [a * b]), binFold];

  yield equal(process(8, ...in0, ...ops)[0], 40320);
  yield equal(process(8, ...in1, ...ops)[0], 40320);

  yield deepequal(process(1, 2, 3, pickN(2)), [1, 2, 3, 2, 3]);
  yield deepequal(
    process(
      (function* () {
        yield T0;
        yield T1;
        yield T2;
        yield T3;
      })(),
      hold(pull),
      loop()
    ),
    [T0, T1, T2, T3]
  );
});
// process(1, 2, 3, cycle, peek, recycle, peek);

////////
// const data = process(asyncsource, transduce(map(x=>x+1)));
// const data = async(asyncsource, transduce(map((x) => x + 1)));
// asyncsource transduce(map((x) => x + 1) transcuce(forEach(console.log))
// asyncsource next
// const i = [T0, T1, T2, T3][Symbol.iterator]();
// yield deepequal(process(i, nextIteration, drop, nextIteration), []);
// process(
//   i,
//   peek,
//   nextIteration,
//   peek,
//   drop,
//   peek,
//   nextIteration,
//   peek,
//   nextIteration,
//   peek
// );
