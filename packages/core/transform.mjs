import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import splitOnSemicolon from "./split-on-semicolon.mjs";
const matchImport = /^import .+/;
const matchExport = /^export .+/;
const matchComment = /^\/\//;
const DEFAULT_EXT = "jth";
const ENDMATCH = /\.jth(['"`])?$/;
const TARGET_EXT = "mjs";
import processLine from "./process-line.mjs";
import jsLine from "./js-line.mjs";

export const transformIterator = function* (
  code,
  {
    runtime = "static",
    operatorFunc = "operators",
    processFunc = "processN",
    customRuntime = "",
  } = {
    runtime: "static",
    operatorFunc: "operators",
    processFunc: "processN",
    customRuntime: "",
  }
) {
  const lines = splitOnSemicolon(code);
  const globals = new Set();

  if (runtime) {
    switch (runtime) {
      case "static":
        {
          yield readFileSync(
            join(
              dirname(fileURLToPath(import.meta.url)),
              "./static-runtime.mjs"
            ),
            "utf8"
          );
        }
        break;
      case "dynamic":
        yield 'import "jth-core/runtime";';
        break;
      case "custom":
        yield customRuntime;
        break;
      case "none":
        break;
    }
  }

  for (const cmd of lines) {
    if (matchComment.test(cmd) || matchExport.test(cmd)) {
      yield cmd;
    } else if (matchImport.test(cmd)) {
      if (ENDMATCH.test(line.line)) {
        const [, quote] = ENDMATCH.exec(line.line);
        yield line.replace(`.${DEFAULT_EXT}${quote}`, `.${TARGET_EXT}${quote}`);
      } else {
        yield line;
      }
    } else {
      const { vars, declaration, line, isOperator, imports, exports, opts } =
        processLine(cmd, { operatorFunc });
      // read any globals from new line
      const newGlobals = [];
      if (vars.length) {
        for (const v of vars) {
          if (globals.has(v)) {
            continue;
          }
          globals.add(v);
          newGlobals.push(v);
        }
      }
      // create line to be evaluated
      yield jsLine(
        line,
        {
          declaration,
          vars: newGlobals,
          processFunc,
          operatorFunc,
          isOperator,
          recordVar: false,
          varGlobal: false,
          imports,
          exports,
          dynamicImport: false,
          opts,
        },
        false,
        false
      );
    }
  }
};

export const transform = (...stuff) =>
  [...transformIterator(...stuff)].join("\n");

export default transform;
