#!/usr/bin/env node --experimental-vm-modules --no-warnings
import pack from "../package.json" with { type: "json" };

import {
  readFileSync,
  writeFileSync,
  unlinkSync,
  mkdirSync,
  lstatSync,
} from "node:fs";
import { extname } from "node:path";
import process from "node:process";
import path from "node:path";
import { spawn } from "node:child_process";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { transform } from "jth-core";
import walk from "./walk.mjs";
import runRepl from "./run-repl.mjs";
import resolveBundle from "../external/resolve-bundle.mjs";
const NAME = "jth";
const VERSION = pack.version;
const TARGET_EXTENSION = "mjs";
const { log } = console;
const genRandom = () => Math.random().toString().slice(2);
const switchExtension = (file, ext) => {
  const index = file.lastIndexOf(".") + 1;
  return `${file.substring(0, index)}${ext}`;
};
// TODO: should I use this to resolve imports? https://stackoverflow.com/a/62272600/1290781

yargs(hideBin(process.argv))
  .version(VERSION)
  .scriptName(NAME)
  // .alias("v", "version") // This prevents repl from working for some reason?
  .usage("$0 <cmd> [args]")
  .command(
    "run [input]",
    `run ${NAME} code`,
    (yargs) => {
      yargs
        .option("code", {
          alias: "c",
          describe: "evaluate inline code instead of file",
          type: "boolean",
        })
        .option("use-runtime", {
          alias: "R",
          describe: "use runtime",
          default: "static",
          type: "string",
        })
        .positional("input", {
          describe: "file or code to run",
          type: "string",
        });
    },
    async function (argv) {
      const { useRuntime } = argv;
      let runtime;
      let customRuntime;
      switch (useRuntime) {
        case "static":
        case "dynamic":
        case "none":
          runtime = useRuntime;
          break;
        default:
          runtime = "custom";
          customRuntime = readFileSync(
            path.resolve(process.cwd(), argv.input),
            "utf8"
          );
          break;
      }
      const output = await transform(
        argv.code
          ? argv.input
          : readFileSync(path.resolve(process.cwd(), argv.input), "utf8"),
        { runtime, customRuntime }
      );
      const randFile = `${
        argv.code ? "." : path.dirname(argv.input)
      }/${genRandom()}.${TARGET_EXTENSION}`;
      await writeFileSync(randFile, output);
      const child = spawn("node", [randFile], {
        stdio: "inherit",
      });
      child.on("exit", (code) => {
        unlinkSync(randFile);
        process.exit(code);
      });
    }
  )
  .command(
    "compile [input] [output]",
    `compile ${NAME} code`,
    (yargs) => {
      yargs
        .option("code", {
          alias: "c",
          type: "boolean",
          describe: "compile code instead of file",
        })
        .option("use-runtime", {
          alias: "R",
          describe: "use runtime",
          default: "static",
          type: "string",
        })
        .option("extension", {
          alias: "e",
          describe: "extension of output files",
          default: TARGET_EXTENSION,
        })
        .option("target", {
          alias: "t",
          describe: "target extension to convert",
          default: "jth",
        })
        .option("runtime", {
          alias: "r",
          describe: "generate runtime",
          default: false,
          type: "boolean",
        })
        .positional("input", {
          describe: "file or code to run",
          type: "string",
        })
        .positional("output", {
          describe: "output file",
          type: "string",
        });
    },
    async function (argv) {
      const { useRuntime } = argv;
      let runtime;
      let customRuntime;
      switch (useRuntime) {
        case "static":
        case "dynamic":
        case "none":
          runtime = useRuntime;
          break;
        default:
          runtime = "custom";
          customRuntime = readFileSync(
            path.resolve(process.cwd(), argv.input),
            "utf8"
          );
          break;
      }

      if (argv.code) {
        // compile code directly to...
        const result = await transform(argv.input, { runtime, customRuntime });
        if (argv.output) {
          // ...a file
          const outfile = path.resolve(process.cwd(), argv.output);
          await writeFileSync(outfile, result);
        } else {
          // ...stdout
          return log(result);
        }
      } else {
        // compile code from...
        const input = path.resolve(process.cwd(), argv.input);
        const isDirectory = lstatSync(input).isDirectory();
        if (isDirectory) {
          // ...a directory to a directory.
          const targets = Array.isArray(argv.target)
            ? argv.target
            : [argv.target];
          const files = await walk(input);
          for await (const i of files) {
            const infile = path.resolve(process.cwd(), argv.input, i);
            let outfile = path.resolve(
              process.cwd(),
              argv.output || argv.input,
              i
            );
            const ext = extname(i).slice(1);
            let transformContent = false;
            if (targets.includes(ext)) {
              outfile = switchExtension(outfile, argv.extension);
              transformContent = true;
            }
            if (infile !== outfile) {
              await mkdirSync(path.dirname(outfile), { recursive: true });
              if (transformContent) {
                const output = await transform(readFileSync(infile, "utf8"), {
                  runtime,
                  customRuntime,
                });
                await writeFileSync(outfile, output);
              } else {
                await writeFileSync(outfile, readFileSync(infile, "utf8"));
              }
            }
          }
        } else {
          //... a file to...
          if (argv.output) {
            //...a file.
            let outfile = path.resolve(
              process.cwd(),
              argv.output || argv.input
            );
            outfile = switchExtension(outfile, argv.extension);
            if (input !== outfile) {
              if (argv.runtime) {
                await writeFileSync(outfile, await resolveBundle(input));
              } else {
                await writeFileSync(
                  outfile,
                  await transform(readFileSync(input, "utf8"), {
                    runtime,
                    customRuntime,
                  })
                );
              }
            }
          } else {
            //...stdout.
            if (argv.runtime) {
              return log(await resolveBundle(input));
            } else {
              return log(
                await transform(readFileSync(input, "utf8"), {
                  runtime,
                  customRuntime,
                })
              );
            }
          }
        }
      }
    }
  )
  .command(
    "repl",
    `interactive ${NAME} read-evaluate-print loop`,
    (yargs) => {
      yargs
        .option("view", {
          alias: "v",
          type: "boolean",
          describe: "view output",
          default: false,
        })
        .option("operator-func", {
          alias: "o",
          type: "boolean",
          describe: "name of operator function",
          default: "operators",
        })
        .option("process-func", {
          alias: "f",
          type: "string",
          describe: "name of process function",
          default: "processN",
        })
        .option("count-in-prompt", {
          alias: "c",
          type: "boolean",
          describe: "name of process function",
          default: false,
        });
    },
    (argv) => {
      log(
        `Welcome to the ${NAME} repl v${VERSION}.
Type ".help" for more information. ${
          argv.view ? "" : '\nType ".view" to see current.'
        }`
      );

      runRepl(argv);
    }
  )
  .demandCommand(1, `try: ${NAME} run -c '"hello world"  @;'`)
  .alias("h", "help")
  .help().argv;
