import repl from "node:repl";
import vm from "node:vm";
import { processLine, jsLine } from "jth-core";
import * as replContext from "jth-core/context";
const STACK_NAME = "___";
const createRepl = (
  {
    operatorFunc = "operators",
    processFunc = "processN",
    view = true,
    history = true,
    countInPrompt = false,
  } = {
    operatorFunc: "operators",
    processFunc: "processN",
    view: true,
    history: true,
    countInPrompt: false,
  }
) => {
  const context = { ...replContext };
  vm.createContext(context);
  context[STACK_NAME] = context[STACK_NAME] || [];
  if (history) {
    history = [];
  }
  const globals = new Set();

  const evalute = async (cmd, __CONTEXT__, __FILENAME__, callback) => {
    try {
      let { vars, declaration, line, isOperator, imports, exports, opts } =
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

      // create line to be evaluatedcou
      let __CURRENTLINE__ = jsLine(line, {
        declaration,
        vars: newGlobals,
        isOperator,
        operatorFunc,
        processFunc,
        imports,
        exports,
        dynamicImport: true,
        context,
        opts,
      });
      history && history.push([cmd, __CURRENTLINE__]);
      __CURRENTLINE__ =
        __CURRENTLINE__ + (view ? `view(...${STACK_NAME});` : "");

      // eval
      const l = new vm.SourceTextModule(__CURRENTLINE__, {
        context,
      });
      await l.link(() => {});
      await l.evaluate();
      if (countInPrompt) {
        replServer.setPrompt(`[${context[STACK_NAME].length}] `);
      }
    } catch (error) {
      if (/Unexpected token '\)'/.test(error.message)) {
        return callback(new repl.Recoverable(error));
      }
      callback(error);
    }
    callback(null);
  };

  const replServer = repl.start({
    prompt: countInPrompt ? `[${context[STACK_NAME]?.length}] ` : "<] ",
    eval: evalute,
    replMode: repl.REPL_MODE_SLOPPY,
  });

  replServer.defineCommand("peek", {
    help: "View current stack",
    action() {
      vm.runInContext(`view(...${STACK_NAME})`, context);
      this.displayPrompt();
    },
  });
  replServer.defineCommand("count", {
    help: "View current size of stack",
    action() {
      vm.runInContext(`view(${STACK_NAME}.length)`, context);
      this.displayPrompt();
    },
  });

  replServer.defineCommand("history", {
    help: "view history",
    action() {
      let keys = 0;
      for (const [key, value] of history) {
        console.log("----------------");
        console.log("  ", key.trim());
        console.log(`${keys++}`);
        console.log("  ", value);
      }
      this.displayPrompt();
    },
  });
  replServer.defineCommand("jth", {
    help: "view jth history",
    action() {
      console.log(
        Array.from(history)
          .map(([jth]) => jth.trim() + ";")
          .join("\n")
      );
      this.displayPrompt();
    },
  });
  replServer.defineCommand("js", {
    help: "view js history",
    action() {
      console.log(
        Array.from(history)
          .map(([, js]) => js)
          .join("\n")
      );
      this.displayPrompt();
    },
  });
  replServer.defineCommand("clear", {
    help: "clear console",
    action() {
      console.clear();
      this.displayPrompt();
    },
  });

  // server.on("exit", () => {});
  return replServer;
};
export default createRepl;
