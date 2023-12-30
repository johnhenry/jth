import { setObj } from "./operators.mjs"; //jth-core/operators
import { applyLastN } from "./tools/index.mjs"; //"jth-tools"
import {
  plus,
  minus,
  times,
  inc,
  dec,
  divide,
  equal,
  coercedEqual,
  exp,
  spread,
  run,
  gt,
  gte,
  lt,
  lte,
  spaceship,
  skipN,
  rewindN,
  noop,
  peek,
  view,
  mod,
  modulus,
  copy,
  sum,
  product,
} from "./core.mjs";
setObj({
  _: copy,
  "@": peek,
  "@@": view,
  "∅": noop,
  "+": plus,
  "-": minus,
  "*": times,
  "**": exp,
  "/": divide,
  "=": equal,
  "==": coercedEqual,
  "++": inc,
  "--": dec,
  "...": spread,
  "!": run,
  "<": gt,
  "<=": gte,
  ">": lt,
  ">=": lte,
  "<=>": spaceship,
  "%": mod,
  "%%": modulus,
  "<<-": rewindN(Infinity)(),
  "->>": skipN(Infinity)(),
  Σ: sum,
  Π: product,
});

// Incrementors
// Examples: -1/, 14+, 32*, 3.414/ ...
const defaultDynamicOperators = new Map();
defaultDynamicOperators.set(
  /^([+-]?(?:\d*\.)?\d+)(n?)([+-\\*\\/\%])$/,
  (o, r) => {
    const [, num, bigint, op] = r.exec(o);
    const n = bigint ? BigInt(num) : Number(num);
    switch (op) {
      case "+":
        // Examples: 1+, 14+, -32+, 3.414+ ...
        return applyLastN(1)((a = 0) => [n + a]);
      case "-":
        // Examples: 1-, 14-, -32*, 3.414- ...
        return applyLastN(1)((a = 0) => [n - a]);
      case "*":
        // Examples: 1*, 14*, -32*, 3.414* ...
        return applyLastN(1)((a = 1) => [n * a]);
      case "/":
        // Examples: 1/, 14/, -32/, 3.414/ ...
        return applyLastN(1)((a = 1) => [n / a]);
      case "%":
        // Examples: 1%, 14%, -32%, 3% ...
        return applyLastN(1)((a = 1) => [((n % a) + a) % a]);
    }
  }
);

// Skip
// Examples: ->, ->2, ->3 ...
defaultDynamicOperators.set(/^->(\d?)$/, (o, r) => {
  const [, num] = r.exec(o);
  if (num) {
    return skipN(Number(num))();
  }
  return skipN(1)();
});
// Rewind
// Examples: <-, 2<-, 3<- ...
defaultDynamicOperators.set(/^(\d?)<-$/, (o, r) => {
  const [, num] = r.exec(o);
  if (num) {
    return rewindN(Number(num))();
  }
  return rewindN(1)();
});

setObj(defaultDynamicOperators);
