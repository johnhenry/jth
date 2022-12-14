// https://stackoverflow.com/a/38739914/1290781
import repl from "node:repl";
import { transform, preamble } from "jth-core";
import { spawn } from "node:child_process";
const PRE = preamble().join("\n");
export const runRepl = () => {
  throw new Error("Temporarily disabled");
  const child = spawn("node", ["-i"], {
    stdio: ["pipe", "pipe", null],
    shell: true,
  });
  child.on("exit", (code) => {
    process.exit(code);
  });
  let outerCallback;
  child.stdout.on("data", (chunk) => {
    if (!outerCallback) {
      return;
    }
    let string = chunk.toString();
    if (string.endsWith("\n")) {
      string = string.slice(0, -1);
    }
    const match = /^(?:undefined\n> )?(?:\.{3} )*$/;
    const match2 = /^(?:.*)\n> $/;
    if (string && !match.test(string)) {
      if (match2.test(string)) {
        const [, out] = string.match(match2);
        outerCallback(null, out);
      } else {
        outerCallback(null, string);
      }
    } else {
      outerCallback(null);
    }
  });
  // child.stderr.on("error", (err) => {
  //   outerCallback(err);
  // });
  let first = true;
  const evaluate = async (cmd, context, filename, callback) => {
    outerCallback = callback;
    const c = await transform(cmd, false);
    if (first) {
      child.stdin.write(PRE);
      first = false;
    }
    child.stdin.write(c);
  };

  const server = repl.start({
    useGlobal: true,
    ignoreUndefined: true,
    eval: evaluate,
  });
  server.on("exit", () => {
    child.kill();
  });
};

export default runRepl;
