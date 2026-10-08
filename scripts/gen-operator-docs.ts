// Regenerates docs/operators.md from the operator registry:
//   npm run docs:ops
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { operatorReferenceMarkdown } from "../packages/jth-stdlib/src/index.ts";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "..", "docs", "operators.md");
writeFileSync(out, operatorReferenceMarkdown(), "utf-8");
console.log(`wrote ${out}`);
