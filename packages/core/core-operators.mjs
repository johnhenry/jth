import { setObj } from "./operators.mjs"; //jth-core/operators
import { applyLastN } from "./tools/index.mjs"; //"jth-tools"
import {
  and,
  andAll,
  or,
  orAll,
  not,
  notAll,
  bitwiseAnd,
  bitwiseOr,
  bitwiseNot,
  bitwiseXor,
  plus,
  minus,
  times,
  inc,
  dec,
  divide,
  equal,
  coercedEqual,
  exp,
  exhaustIterator,
  spread,
  executeWait,
  executeWaitSpread,
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
  sum,
  product,
  wait,
  waitAll,
  mean,
  abs,
  strseq,
  ifElse,
  ELSE,
  ELSEIF,
} from "./core.mjs";
setObj({
  "||": or,
  "&&": and,
  "~~": not,
  "|||": orAll,
  "&&&": andAll,
  "~~~": notAll,
  "|": bitwiseOr,
  "&": bitwiseAnd,
  "~": bitwiseNot,
  "^": bitwiseXor,
  "@": peek,
  "@@": view,
  "∅": noop,
  "+.": strseq,
  "+": plus,
  "-": minus,
  "*": times,
  "⋅": times,
  "**": exp,
  "/": divide,
  "÷": divide,
  "=": equal,
  "==": coercedEqual,
  "++": inc,
  "--": dec,
  "..": exhaustIterator,
  "...": spread,
  abs: abs,
  "|𝑥|": abs,
  $: executeWait,
  $$: executeWaitSpread,
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
  x̄: mean,
  _: wait,
  __: waitAll,
  if: ifElse,
  else: ELSE,
  elseif: ELSEIF,
});

const defaultDynamicOperators = new Map();
// Incrementors
// Examples: -1/, 14+, 32*, 3.414/ ...
defaultDynamicOperators.set(
  /^([+-]?(?:\d*\.)?\d*)(n?)([+\-\*\\/\%÷⋅]|[\*]{2}|[\%]{2})$/,
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
      case "⋅":
        // Examples: 1*, 14*, -32*, 3.414* ...
        return applyLastN(1)((a = 1) => [n * a]);
      case "/":
      case "÷":
        // Examples: 1/, 14/, -32/, 3.414/ ...
        return applyLastN(1)((a = 1) => [n / a]);
      case "%":
        // Examples: 1%, 14%, -32%, 3% ...
        return applyLastN(1)((a = 1) => [((n % a) + a) % a]);
      case "**":
        // Examples: 1**, 14**, -32**, 3.414** ...
        return applyLastN(1)((a = 0) => [n ** a]);
      case "%%":
        // Examples: 1%%, 14%%, -32%%, 3.414%% ...
        return applyLastN(1)((a = 0) => [n % a]);
    }
    throw new Error(`Unknown operator: ${o}`);
  }
);

// Logarithms 3log, 2.718log, 10log ...
defaultDynamicOperators.set(/^([+-]?(?:\d*\.)?\d*)log$/, (o, r) => {
  const [, base] = r.exec(o);
  return (...stack) => {
    const result = Math.log(stack.pop()) / Math.log(Number(base));
    return [...stack, result];
  };
});

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
