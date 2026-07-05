import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "stack": "src/stack.ts",
    "op": "src/op.ts",
    "meta": "src/meta.ts",
    "process-n": "src/process-n.ts",
    "registry": "src/registry.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
