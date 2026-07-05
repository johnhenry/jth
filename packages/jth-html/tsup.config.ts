import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "nodes": "src/nodes.ts",
    "render": "src/render.ts",
    "operators": "src/operators.ts",
    "register": "src/register.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
