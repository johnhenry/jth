import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "tokens": "src/tokens.ts",
    "ast": "src/ast.ts",
    "errors": "src/errors.ts",
    "interfaces": "src/interfaces.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  platform: "node",
  tsconfig: "tsconfig.build.json",
});
