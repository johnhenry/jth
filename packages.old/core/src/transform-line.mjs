import splitOnSpace from "./split-on-space.mjs";
const importMatch = /^import .+/;
const exportMatch = /^export .+/;
const commentMatch = /^\/\//;
const assignMatch = /^(.+)\s?->\s?(.+)$/;
const doMatch = /^js\{(.+)}$/;
const DEFAULT_EXT = "jth";
const ENDMATCH = /\.jth(['"`])?$/;
const TARGET_EXT = "mjs";

const transformLine = async (l, process, tokenizer) => {
  const line = l.trim();
  if (
    importMatch.test(line) ||
    exportMatch.test(line) ||
    commentMatch.test(line)
  ) {
    if (ENDMATCH.test(line)) {
      const [, quote] = ENDMATCH.exec(line);
      return {
        lineJS: line.replace(
          `.${DEFAULT_EXT}${quote}`,
          `.${TARGET_EXT}${quote}`
        ),
        vars: [],
      };
    }
    return {
      lineJS: line,
      vars: [],
    };
  } else if (doMatch.test(line)) {
    const [, body] = line.match(doMatch);

    return { lineJS: body, vars: [] };
  }
  let name;
  let value;
  if (assignMatch.test(line)) {
    [, value, name] = line.match(assignMatch);
    value = value.trim();
    name = name.trim();
  }
  const split = splitOnSpace(name ? value : line);
  if (split) {
    const n = [];
    const vars = [];
    if (name) {
      vars.push(name);
    }
    for (const s of split) {
      const { tokens, vars: v } = await tokenizer(s);
      n.push(...tokens);
      vars.push(...v);
    }

    return {
      lineJS: `${name ? `${name} = ` : ""}await ${process}([${n.join(",")}])`,
      vars,
    };
  }
  return { lineJS: split, vars: [] };
};

export default transformLine;
