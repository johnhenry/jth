import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/*/__tests__/**/*.test.{ts,mjs}",
      "test/**/*.test.{ts,mjs}",
    ],
    // Several integration tests (packages/jth-cli/__tests__/run.test.ts,
    // test/e2e/**) spawn real `node` subprocesses to compile/bundle/run
    // .jth programs end-to-end. Under full-suite parallel load these
    // legitimately take longer than vitest's 5000ms default, causing
    // flaky timeouts on otherwise-passing tests. Each spawn already has
    // its own internal timeout (up to 60000ms) to catch true hangs, so
    // raising the outer per-test timeout here just removes false-positive
    // failures without weakening hang detection.
    testTimeout: 20000,
  },
});
