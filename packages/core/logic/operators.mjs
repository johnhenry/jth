import { setObj } from "../operators.mjs"; //jth-core/operators
import { and, or, not } from "./index.mjs";
setObj({
  "||": or,
  "&&": and,
  "!!": not,
});
