import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bin/jth": "bin/jth.ts",
  },
  format: ["esm"],
  // d.ts only for the library entry; the bin is an executable.
  dts: { entry: { index: "src/index.ts" } },
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
