#!/usr/bin/env node
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
const NAME = "jth";
const TARGET_EXTENSION = "mjs";
const { log } = console;
const genRandom = () => Math.random().toString().slice(2);
const switchExtension = (file, ext) => {
  const index = file.lastIndexOf(".") + 1;
  return `${file.substring(0, index)}${ext}`;
};

yargs(hideBin(process.argv))
  .scriptName(NAME)
  .usage("$0 <cmd> [args]")
  .command(
    "run [input]",
    `run ${NAME} code`,
    (yargs) => {
      yargs
        .option("code", {
          alias: "c",
          describe: "evaluate code instead of file",
          type: "boolean",
        })
        .positional("input", {
          describe: "file or code to run",
          type: "string",
        });
    },
    async function (argv) {
      const output = await transform(
        argv.code
          ? argv.input
          : readFileSync(path.resolve(process.cwd(), argv.input), "utf8")
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
      if (argv.code) {
        // compile code directly to...
        if (argv.output) {
          // ...a file
          const outfile = path.resolve(process.cwd(), argv.output);
          await writeFileSync(outfile, await transform(argv.input));
        } else {
          // ...stdout
          return log(await transform(argv.input));
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
                const output = await transform(readFileSync(infile, "utf8"));
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
              await writeFileSync(
                outfile,
                await transform(readFileSync(input, "utf8"))
              );
            }
          } else {
            //...stdout.
            return log(await transform(readFileSync(input, "utf8")));
          }
        }
      }
    }
  )
  .command(
    "repl",
    `interactive ${NAME} read-evaluate-print loop`,
    async function (argv) {
      await runRepl();
    }
  )
  //   .demandCommand(1, `try: ${NAME} run -e '"hello world" @!;'`)
  .alias("h", "help")
  .help().argv;
