import quiz, { equal } from "pop-quiz";
import { execSync } from "node:child_process";
import { mkdirSync, unlinkSync, cpSync, rmSync } from "node:fs";
const TARGET = "./src/index.mjs";
const TEST_DIR = "./testland";
const node = (command) =>
  execSync(`node ${command}`, {
    stdio: null,
  })
    .toString()
    .trim();

const exec = (command) => node(`${TARGET} ${command}`);

try {
  rmSync(`${TEST_DIR}`, { recursive: true, force: true });
  mkdirSync(`${TEST_DIR}`);
  cpSync("quiz", `${TEST_DIR}/quiz/`, { recursive: true, force: true });
  // Tests:Start
  await quiz("command RUN shoud run simple code", function* () {
    yield equal(exec(`run ./quiz/module.jth`), `1 2 3 4`);
  });
  await quiz(
    "command RUN shoud run module code with modules imported from npm",
    function* () {
      yield equal(exec(`run ./quiz/importNPM.jth`), `0 1 2 3 4 5 6 7 8 9`);
    }
  );
  await quiz(
    "command RUN shoud run inline code with 'code' flag",
    function* () {
      yield equal(
        exec(`run --code '"hello world" @!;'`),
        "hello world",
        "(using --c flag)"
      );
      yield equal(
        exec(`run -c '"hello world" @!;'`),
        "hello world",
        "(with -c shorthand)"
      );
    }
  );

  await quiz("command COMPILE shoud compile individual files", function* () {
    yield equal(exec(`compile ./quiz/module.jth ${TEST_DIR}/module.mjs`), ``);
    yield equal(node(`${TEST_DIR}/module.mjs`), `1 2 3 4`);
  });

  await quiz(
    "command COMPILE shoud compile directories into themselves",
    function* () {
      yield equal(exec(`compile ${TEST_DIR}/quiz`), ``);
      yield equal(node(`${TEST_DIR}/quiz/module.mjs`), `1 2 3 4`);
      yield equal(
        node(`${TEST_DIR}/quiz/importNPM.mjs`),
        `0 1 2 3 4 5 6 7 8 9`
      );
      yield equal(
        node(`${TEST_DIR}/quiz/importLocal.mjs`).split("\n").join(" "),
        `1 2 3 4 1 2 3 4 5 6 7 8`
      );
    }
  );

  await quiz(
    "command COMPILE shoud compile directories into other directories",
    function* () {
      yield equal(exec(`compile quiz ${TEST_DIR}/quiz.compiled`), ``);
      yield equal(node(`${TEST_DIR}/quiz.compiled/module.mjs`), `1 2 3 4`);
      yield equal(
        node(`${TEST_DIR}/quiz.compiled/importNPM.mjs`),
        `0 1 2 3 4 5 6 7 8 9`
      );
      yield equal(
        node(`${TEST_DIR}/quiz.compiled/importLocal.mjs`).split("\n").join(" "),
        `1 2 3 4 1 2 3 4 5 6 7 8`
      );
    }
  );
  await quiz("command COMPILE shoud compile code to a file", function* () {
    yield equal(
      exec(`compile --code '"Hello World" @!;' ${TEST_DIR}/hello.mjs`),
      ``
    );
    yield equal(node(`${TEST_DIR}/hello.mjs`), `Hello World`);
  });

  // Tests:End
} finally {
  // Tests: Cleanup
  rmSync(`${TEST_DIR}`, { recursive: true, force: true });
}
