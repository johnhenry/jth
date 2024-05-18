import { set } from "../operators.mjs"; // jth-core/operators
import { attackStack, collapseBinary } from "../tools/index.mjs"; // jth-tools/
import { hyperoperation } from "./hyperoperation.mjs"; // hyperoperation

// Set hyperoperation as dynamic operator
// Examples: ***, ****, ***** ...
set(/^[*]{3,}$/, (o) => {
  const h = hyperoperation(o.length + 1);
  return attackStack((n) => collapseBinary(n, (a, b) => [h(a, b)], 2));
});
