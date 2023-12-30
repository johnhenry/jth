import {
  process_ as p,
  apply_ as a,
  expand$ as e,
  compose$ as c,
  peek$ as pe,
} from "./utility.mjs";

export const genDefaults = (NONCE = "") => ({
  process: "__PROCESS__" + NONCE,
  apply: "__APPLY__" + NONCE,
  expand: "__EXPAND__" + NONCE,
  compose: "__COMPOSE__" + NONCE,
  peek: "__PEEK__" + NONCE,
});
const defaults = genDefaults();
export const preamble = (
  {
    process = defaults.process,
    apply = defaults.apply,
    expand = defaults.expand,
    compose = defaults.compose,
    peek = defaults.peek,
  } = genDefaults()
) => [
  `const ${process} = ${p.toString()};`,
  `const ${apply} = ${a.toString()};`,
  `const ${expand} = ${e.toString()};`,
  `const ${compose} = ${c.toString()};`,
  `const ${peek} = ${pe.toString()};`,
];

export default preamble;
