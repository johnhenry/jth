import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "lexer": "src/lexer.ts",
    "parser": "src/parser.ts",
    "codegen": "src/codegen.ts",
    "transform": "src/transform.ts",
    "run": "src/run.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
