import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
