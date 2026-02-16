import { registry, annotate } from "jth-runtime";
// Import from all modules and register
import * as stackOps from "./stack-ops.mjs";
import * as arithmetic from "./arithmetic.mjs";
import * as comparison from "./comparison.mjs";
import * as logic from "./logic.mjs";
import * as controlFlow from "./control-flow.mjs";
import * as errorHandling from "./error-handling.mjs";
import * as stringOps from "./string-ops.mjs";
import * as typeOps from "./type-ops.mjs";
import * as serialization from "./serialization.mjs";
import * as arrayOps from "./array-ops.mjs";
import * as dictOps from "./dict-ops.mjs";
import * as combinators from "./combinators.mjs";
import * as asyncOps from "./async-ops.mjs";
import * as metaOps from "./meta-ops.mjs";
import * as iteratorOps from "./iterator-ops.mjs";
import * as sequences from "./sequences.mjs";
import * as stats from "./statistics.mjs";
import { registerDynamicOps } from "./dynamic-ops.mjs";
import { registerHyperops } from "./hyperoperations.mjs";

export function registerAll() {
  // Stack ops
  registry.set("noop", stackOps.noop);
  registry.set("\u2205", stackOps.noop);
  registry.set("clear", stackOps.clear);
  registry.set("...", stackOps.spread);
  registry.set("drop", stackOps.drop);
  registry.set("dupe", stackOps.dupe);
  registry.set("copy", stackOps.copy);
  registry.set("swap", stackOps.swap);
  registry.set("reverse", stackOps.reverse);
  registry.set("count", stackOps.count);
  registry.set("collect", stackOps.collect);
  registry.set("@", stackOps.peek);
  registry.set("@@", stackOps.view);

  // Arithmetic
  registry.set("+", arithmetic.plus);
  registry.set("-", arithmetic.minus);
  registry.set("*", arithmetic.times);
  registry.set("\u22C5", arithmetic.times);
  registry.set("/", arithmetic.divide);
  registry.set("\u00F7", arithmetic.divide);
  registry.set("**", arithmetic.exp);
  registry.set("%", arithmetic.mod);
  registry.set("%%", arithmetic.modulus);
  registry.set("++", arithmetic.inc);
  registry.set("--", arithmetic.dec);
  registry.set("\u03A3", arithmetic.sum);
  registry.set("\u03A0", arithmetic.product);
  registry.set("abs", arithmetic.abs);
  registry.set("|\uD835\uDC65|", arithmetic.abs);
  registry.set("\u221A", arithmetic.sqrt);
  registry.set("sqrt", arithmetic.sqrt);
  registry.set("floor", arithmetic.floor);
  registry.set("ceil", arithmetic.ceil);
  registry.set("round", arithmetic.round);
  registry.set("trunc", arithmetic.trunc);
  registry.set("log", arithmetic.log);
  registry.set("min", arithmetic.min);
  registry.set("max", arithmetic.max);

  // Comparison
  registry.set("=", comparison.equal);
  registry.set("==", comparison.coercedEqual);
  registry.set("<", comparison.lt);
  registry.set("<=", comparison.lte);
  registry.set(">", comparison.gt);
  registry.set(">=", comparison.gte);
  registry.set("<=>", comparison.spaceship);

  // Logic
  registry.set("&&", logic.and);
  registry.set("||", logic.or);
  registry.set("xor", logic.xor);
  registry.set("nand", logic.nand);
  registry.set("nor", logic.nor);
  registry.set("~~", logic.not);
  registry.set("not", logic.not);

  // Control flow
  registry.set("if", controlFlow.ifOp);
  registry.set("elseif", controlFlow.elseifOp);
  registry.set("else", controlFlow.elseOp);
  registry.set("when", controlFlow.when);
  registry.set("drop-when", controlFlow.dropWhen);
  registry.set("keep-if", controlFlow.keepIf);
  registry.set("drop-if", controlFlow.dropIf);
  registry.set("times", controlFlow.timesOp);

  // Error handling
  registry.set("try", errorHandling.tryOp);
  registry.set("throw", errorHandling.throwOp);
  registry.set("error?", errorHandling.isError);

  // String ops
  registry.set("len", stringOps.len);
  registry.set("upper", stringOps.upper);
  registry.set("lower", stringOps.lower);
  registry.set("trim", stringOps.trim);
  registry.set("strcat", stringOps.strcat);
  registry.set("strseq", stringOps.strseq);

  // Type ops
  registry.set("typeof", typeOps.typeOf);
  registry.set("number?", typeOps.isNumber);
  registry.set("string?", typeOps.isString);
  registry.set("array?", typeOps.isArray);
  registry.set("nil?", typeOps.isNil);
  registry.set("function?", typeOps.isFunction);
  registry.set("empty?", typeOps.isEmpty);
  registry.set("contains?", typeOps.contains);

  // Serialization
  registry.set("into-json", serialization.intoJson);
  registry.set("to-json", serialization.toJson);
  registry.set("into-lines", serialization.intoLines);
  registry.set("to-lines", serialization.toLines);

  // Array ops
  registry.set("push", arrayOps.push);
  registry.set("pop", arrayOps.pop);
  registry.set("shift", arrayOps.shift);
  registry.set("unshift", arrayOps.unshift);
  registry.set("suppose", arrayOps.suppose);
  registry.set("flatten", arrayOps.flatten);
  registry.set("map", arrayOps.mapOp);
  registry.set("filter", arrayOps.filterOp);
  registry.set("reduce", arrayOps.reduceOp);
  registry.set("fold", arrayOps.foldOp);
  registry.set("bend", arrayOps.bendOp);

  // Dict ops
  registry.set("keys", dictOps.keys);
  registry.set("values", dictOps.values);
  registry.set("entries", dictOps.entries);
  registry.set("merge", dictOps.merge);
  registry.set("record", dictOps.record);

  // Async ops
  registry.set("_", asyncOps.wait);
  registry.set("__", asyncOps.waitAll);

  // Meta ops
  registry.set("$", metaOps.execute);
  registry.set("$$", metaOps.executeSpread);
  registry.set(
    "<<-",
    annotate(
      () => {},
      { rewind: -1 }
    )
  );
  registry.set(
    "->>",
    annotate(
      () => {},
      { skip: -1 }
    )
  );

  // Iterator ops
  registry.set("next", iteratorOps.next);
  registry.set("iter", iteratorOps.iter);
  registry.set("..", iteratorOps.exhaustIterator);

  // Sequences
  registry.set("fibonacci", sequences.fibonacci);

  // Statistics
  registry.set("x\u0304", stats.mean);
  registry.set("mean", stats.mean);
  registry.set("median", stats.median);
  registry.set("mode", stats.mode);
  registry.set("modes", stats.modes);

  // Dynamic ops
  registerDynamicOps();
  registerHyperops();
}
