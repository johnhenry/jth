import transformLine from "./transform-line.mjs";
import createTokenizer from "./create-tokenizer.mjs";
import preamble, { genDefaults as genPreambleDefaults } from "./preamble.mjs";

const matchSquareBrackets = /^\[(.*)\]$/;

const stripSquareBrackets = (s) => {
  const match = matchSquareBrackets.exec(s);
  if (match) {
    return match[1].split(",");
  } else {
    return [s];
  }
};

export const transformIterator = async function* (
  jsi,
  { process, apply, expand, compose, peek } = genPreambleDefaults(),
  usePreamble = true
) {
  if (usePreamble) {
    yield* preamble({ process, apply, expand, compose, peek });
  }
  const tokenizer = createTokenizer({
    process,
    apply,
    expand,
    compose,
    peek,
  });
  const lines = jsi.match(/(?:[^;"]+|"[^"]*")+/g);
  const variables = [];
  const text = [];
  for (const line of lines) {
    const { lineJS, vars } = await transformLine(line, process, tokenizer);
    if (vars.length) {
      variables.push(...vars);
    }
    if (lineJS) {
      text.push(lineJS);
    }
  }
  if (variables.length) {
    yield `let ${[...new Set(variables.map(stripSquareBrackets).flat())].join(
      ", "
    )};`;
  }
  yield* text.map((line) => `${line};`);
};
export const transform = async (...args) => {
  const lines = [];
  for await (const line of transformIterator(...args)) {
    lines.push(line);
  }

  return lines.join("\n");
};
export * from "./utility.mjs";

export { preamble, genPreambleDefaults };
export default transform;
