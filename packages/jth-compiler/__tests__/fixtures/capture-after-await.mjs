import { run } from "@johnhenry/jth-compiler";
import "@johnhenry/jth-stdlib";

const a = await run('"A1" peek; 20 _ "A2" peek; 5 _ "A3" peek;', { captureLog: true });
const b = await run('"B1" peek; 5 _ [7 8] #[ peek 1 _ ] map; "B2" peek;', { captureLog: true });
console.log(JSON.stringify({ a: a.output, b: b.output }));
