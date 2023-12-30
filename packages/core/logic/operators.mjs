import { setObj } from "../operators.mjs"; //jth-core/operators
import { and, or } from "./index.mjs";
setObj({
  "||": or,
  "&&": and,
});
