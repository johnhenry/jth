import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "eval": "src/eval.ts",
    "context": "src/context.ts",
    "scoped-registry": "src/scoped-registry.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
