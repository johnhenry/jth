import { registry, annotate } from "@johnhenry/jth-runtime";
import type { Stack } from "@johnhenry/jth-runtime";
// Import from all modules and register
import * as stackOps from "./stack-ops.ts";
import * as arithmetic from "./arithmetic.ts";
import * as comparison from "./comparison.ts";
import * as logic from "./logic.ts";
import * as controlFlow from "./control-flow.ts";
import * as errorHandling from "./error-handling.ts";
import * as stringOps from "./string-ops.ts";
import * as typeOps from "./type-ops.ts";
import * as serialization from "./serialization.ts";
import * as arrayOps from "./array-ops.ts";
import * as dictOps from "./dict-ops.ts";
import * as combinators from "./combinators.ts";
import * as asyncOps from "./async-ops.ts";
import * as metaOps from "./meta-ops.ts";
import * as iteratorOps from "./iterator-ops.ts";
import * as sequences from "./sequences.ts";
import * as stats from "./statistics.ts";
import { registerDynamicOps } from "./dynamic-ops.ts";
import { registerHyperops } from "./hyperoperations.ts";

/**
 * Names of the static operators registered by jth-stdlib itself (as opposed
 * to other packages that also write to the global registry, e.g. jth-html).
 * jth-eval's "restricted" sandbox builds its allowlist from this set, so
 * only vetted, pure stdlib ops are ever admitted.
 */
const stdlibNames = new Set<string>();

export function stdlibOpNames(): string[] {
  return [...stdlibNames];
}

function set(name: string, fn: Parameters<typeof registry.set>[1]): void {
  stdlibNames.add(name);
  registry.set(name, fn);
}

/**
 * Adapt a configured-operator factory to the codegen calling convention:
 * `name(arg)` pushes `arg` onto the stack and then invokes the registered
 * operator, which pops its configuration and applies the factory.
 */
function configured(factory: (n: number) => (stack: Stack) => void) {
  return (stack: Stack): void => factory(stack.pop() as number)(stack);
}

export function registerAll() {
  // Stack ops
  set("noop", stackOps.noop);
  set("\u2205", stackOps.noop);
  set("clear", stackOps.clear);
  set("...", stackOps.spread);
  set("spread", stackOps.spread);
  set("drop", stackOps.drop);
  // Configured ops: written `name(n)` in source (config arg is popped from the stack)
  set("keepN", configured(stackOps.keepN));
  set("retrieve", configured(stackOps.retrieve));
  set("dig", configured(stackOps.dig));
  set("bury", configured(stackOps.bury));
  set("dupe", stackOps.dupe);
  set("dup", stackOps.dup);
  set("copy", stackOps.copy);
  set("swap", stackOps.swap);
  set("reverse", stackOps.reverse);
  set("count", stackOps.count);
  set("depth", stackOps.depth);
  set("collect", stackOps.collect);
  set("peek", stackOps.peek);
  set("peek-all", stackOps.peekAll);
  set("apply", stackOps.apply);
  set("exec", stackOps.exec);
  set("over", stackOps.over);
  set("rot", stackOps.rot);

  // Arithmetic
  set("+", arithmetic.plus);
  set("-", arithmetic.minus);
  set("*", arithmetic.times);
  set("\u22C5", arithmetic.times);
  set("/", arithmetic.divide);
  set("\u00F7", arithmetic.divide);
  set("**", arithmetic.exp);
  set("%", arithmetic.mod);
  set("%%", arithmetic.modulus);
  set("++", arithmetic.inc);
  set("--", arithmetic.dec);
  set("\u03A3", arithmetic.sum);
  set("\u03A0", arithmetic.product);
  set("abs", arithmetic.abs);
  set("|\uD835\uDC65|", arithmetic.abs);
  set("\u221A", arithmetic.sqrt);
  set("sqrt", arithmetic.sqrt);
  set("floor", arithmetic.floor);
  set("ceil", arithmetic.ceil);
  set("round", arithmetic.round);
  set("trunc", arithmetic.trunc);
  set("log", arithmetic.log);
  set("min", arithmetic.min);
  set("max", arithmetic.max);
  // Word-form aliases
  set("plus", arithmetic.plus);
  set("minus", arithmetic.minus);
  set("mul", arithmetic.mul);
  set("div", arithmetic.div);
  set("mod", arithmetic.mod);
  set("pow", arithmetic.pow);

  // Comparison
  set("=", comparison.equal);
  set("==", comparison.coercedEqual);
  set("<", comparison.lt);
  set("<=", comparison.lte);
  set(">", comparison.gt);
  set(">=", comparison.gte);
  set("<=>", comparison.spaceship);
  // Predicate-style comparison aliases
  set("eq?", comparison.equal);
  set("ne?", comparison.notEqual);
  set("!=", comparison.notEqual);
  set("lt?", comparison.lt);
  set("le?", comparison.lte);
  set("gt?", comparison.gt);
  set("ge?", comparison.gte);

  // Logic
  set("&&", logic.and);
  set("||", logic.or);
  set("xor", logic.xor);
  set("nand", logic.nand);
  set("nor", logic.nor);
  set("~~", logic.not);
  set("not", logic.not);

  // Control flow
  set("if", controlFlow.ifOp);
  set("elseif", controlFlow.elseifOp);
  set("else", controlFlow.elseOp);
  set("when", controlFlow.when);
  set("drop-when", controlFlow.dropWhen);
  set("keep-if", controlFlow.keepIf);
  set("drop-if", controlFlow.dropIf);
  set("times", controlFlow.timesOp);
  set("while", controlFlow.whileOp);
  set("until", controlFlow.untilOp);
  set("break", controlFlow.breakOp);

  // Error handling
  set("try", errorHandling.tryOp);
  set("throw", errorHandling.throwOp);
  set("error?", errorHandling.isError);

  // String ops
  set("len", stringOps.len);
  set("upper", stringOps.upper);
  set("lower", stringOps.lower);
  set("trim", stringOps.trim);
  set("strcat", stringOps.strcat);
  set("strseq", stringOps.strseq);
  set("startsWith", stringOps.startsWith);
  set("endsWith", stringOps.endsWith);
  set("indexOf", stringOps.indexOf);
  // Predicate-style string aliases
  set("starts?", stringOps.startsWith);
  set("ends?", stringOps.endsWith);
  set("index-of", stringOps.indexOf);

  // Type ops
  set("typeof", typeOps.typeOf);
  set("number?", typeOps.isNumber);
  set("string?", typeOps.isString);
  set("array?", typeOps.isArray);
  set("nil?", typeOps.isNil);
  set("function?", typeOps.isFunction);
  set("empty?", typeOps.isEmpty);
  set("contains?", typeOps.contains);

  // Serialization (canonical: into-X = serialize, from-X = parse/decode)
  set("into-json", serialization.intoJson);
  set("from-json", serialization.fromJson);
  set("into-lines", serialization.intoLines);
  set("from-lines", serialization.fromLines);
  // Backward-compatible aliases
  set("to-json", serialization.toJson);
  set("to-lines", serialization.toLines);

  // Array ops
  set("push", arrayOps.push);
  set("pop", arrayOps.pop);
  set("shift", arrayOps.shift);
  set("unshift", arrayOps.unshift);
  set("suppose", arrayOps.suppose);
  set("flatten", arrayOps.flatten);
  set("map", arrayOps.mapOp);
  set("filter", arrayOps.filterOp);
  set("reduce", arrayOps.reduceOp);
  set("fold", arrayOps.foldOp);
  set("bend", arrayOps.bendOp);

  // Dict ops
  set("keys", dictOps.keys);
  set("values", dictOps.values);
  set("entries", dictOps.entries);
  set("merge", dictOps.merge);
  set("record", dictOps.record);

  // Combinators
  set("each", combinators.each);
  set("fanout", combinators.fanout);
  set("zip", combinators.zip);
  set("compose", combinators.compose);

  // Async ops
  set("_", asyncOps.wait);
  set("__", asyncOps.waitAll);

  // Meta ops
  set("$", metaOps.execute as any);
  set("$$", metaOps.executeSpread as any);
  set(
    "<<-",
    annotate(
      () => {},
      { rewind: -1 }
    ) as any
  );
  set(
    "->>",
    annotate(
      () => {},
      { skip: -1 }
    ) as any
  );

  // Iterator ops
  set("next", iteratorOps.next);
  set("iter", iteratorOps.iter);
  set("..", iteratorOps.exhaustIterator);

  // Sequences
  set("fibonacci", sequences.fibonacci);

  // Statistics
  set("x\u0304", stats.mean);
  set("mean", stats.mean);
  set("median", stats.median);
  set("mode", stats.mode);
  set("modes", stats.modes);

  // Dynamic ops
  registerDynamicOps();
  registerHyperops();
}
