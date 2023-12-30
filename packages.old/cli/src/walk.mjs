// https://stackoverflow.com/a/5827895/1290781

import path from "node:path";
import fs from "node:fs";
export const walk = async function* (dir, len = dir.length) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry, len);
    else if (d.isFile()) yield entry.substring(len + 1);
  }
};
export default walk;
